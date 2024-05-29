import { Hono } from "hono";
import { streamSSE, SSEStreamingApi } from "hono/streaming";
import { serveStatic } from "hono/bun";
import { html } from "hono/html";
import { ChatCompletionMessageParam } from "openai/src/resources/chat/completions";
import { GptChat } from "./GptChat";
import { Layout } from "./Layout";
import { models_client, models_name, models_conf } from "./models";

// app_data init

const system_prompt: ChatCompletionMessageParam = {
  role: "system",
  content: "You are a helpful assistant.",
};

function getRandomName() {
  const words = [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
    "honeydew",
    "kiwi",
    "lemon",
  ];
  return words[Math.floor(Math.random() * words.length)];
}


const data_human_chat: { [key: string]: string[] } = {};
const data_human_chat_count: { [name: string]: number } = {};

const data_human_chat_history: string[] = [];
const data_gpt_chat_history: {
  [key: string]: Array<ChatCompletionMessageParam>;
} = {};
const data_say_end_count: {
  [key: string]: number;
} = {};

function setMsgQueue(name: string, msg: string) {
  data_human_chat[name] = data_human_chat[name] || [];
  if (msg.trim() === "") return;

  data_human_chat[name].push(msg);
  data_human_chat_history.push(msg);
}

const data_gptQueue: { [key: string]: string[] } = {};

function setGptQueue(name: string, msg: string) {
  data_gptQueue[name] = data_gptQueue[name] || [];
  if (msg.trim() === "") return;
  data_gptQueue[name].push(msg);
}

//core

async function ask_to_gpt(
  myname: string,
  question: string,
  model: string,
  stream: SSEStreamingApi,
  model_index: number,
) {
  const m_n = `${model}_${myname}`;
  //console.log("ask fun", question, model);
  const _say: ChatCompletionMessageParam = {
    role: "user",
    content: `${question}`,
  };

  data_gpt_chat_history[m_n].push(_say);

  //console.log("send", data_gpt_chat_history[m_n]);

  const completion = await models_client[model].chat.completions.create({
    messages: [_say],
    model,
    temperature: 0.3,
    stream: true,
  });
  const last_gpt_say: string[] = [];
  let chunk_index = 0;
  for await (const chunk of completion) {
    chunk_index++;
    //console.log(chunk.choices[0]?.delta);
    const chunk_txt = chunk.choices[0]?.delta?.content || "";

    last_gpt_say.push("gpt:" + model, chunk_txt);
    if (chunk_index == 1) {
      stream.writeSSE({
        data: `gpt_ask("${model}",'${btoa(encodeURIComponent("User:" + question))}')`,
        event: "gpt",
        id: String(sse_count_index++),
      });
    }
    stream.writeSSE({
      data: `gpt_say_word("${model}",'${btoa(encodeURIComponent(chunk_txt))}')`,
      event: "gpt",
      id: String(sse_count_index++),
    });
    if (chunk.choices[0]?.finish_reason == "stop") {
      ++data_say_end_count[m_n];
      // const _say: ChatCompletionMessageParam = {
      //   role: "assistant",
      //   content: last_gpt_say.join(""),
      // };
      //console.log("gpt:" + model, _say);
      //last_gpt_say.length = 0;
      //no need to record gpts 
      //data_gpt_chat_history[m_n].push(_say)

      stream.writeSSE({
        data: `gpt_say_end("${model}")`,
        event: "gpt",
        id: String(sse_count_index++),
      });

      //   stream.close();
      // }
      break;
    }
  }
}

const app = new Hono();

app.get(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/static"),
  }),
);
app.get("/", serveStatic({ path: "./static/index.html" }));

app.get("/init", (c) => {
  let myname = getRandomName();

  console.log("init context", myname);

  if (myname === undefined) throw new Error("myname undefined error");

  data_gptQueue[myname] = [];

  if (data_human_chat[myname] == undefined) data_human_chat[myname] = [];

  if (data_human_chat_count[myname] == undefined)
    data_human_chat_count[myname] = 0;

  for (const m of models_name) {
    const m_n = `${m}_${myname}`;

    data_say_end_count[m_n] = 0;
    data_gpt_chat_history[m_n] = [];
    data_gpt_chat_history[m_n].push(system_prompt);
    data_gpt_chat_history[m_n].push({
      role: "user",
      content: `I am ${myname}`,
    });
  }

  return c.html(
    <Layout>
      <div>
        {html` <h3>I am ${myname}.</h3> `}
        <GptChat myname={myname} models_name={models_name} />
      </div>
    </Layout>,
  );
});

app.post("/chat", async (c) => {
  const { myname, msg } = await c.req.parseBody();
  setMsgQueue(myname as string, `${myname}:${msg}`);
  return c.html(<div></div>);
});

app.post("/gpt", async (c) => {
  const { myname, msg } = await c.req.parseBody();
  setGptQueue(myname as string, msg as string);

  return c.html(<div></div>);
});

let sse_count_index = 0;

app.get("/sse", async (c) => {
  // no code here

  return streamSSE(c, async (stream) => {
    stream.onAbort(() => stream.close());

    // no code here
    while (true) {
      //code here start
      const { myname } = c.req.query();

      if (myname) {
        //gpt chat
        if (data_gptQueue[myname] && data_gptQueue[myname].length > 0) {
          const gpt_ask = data_gptQueue[myname].pop() || "";

           
            const promises = models_conf.map((m, model_index) =>
              ask_to_gpt(
                myname,
                gpt_ask,
                m.model,
                stream,
                model_index,
              ),
            );
            Promise.all(promises);
            //console.log('end ')
          
        }

        // human chat
        if (
          data_human_chat_count[myname] &&
          data_human_chat_count[myname] >= 0 &&
          data_human_chat_history.length > data_human_chat_count[myname]
        ) {
          const msg = data_human_chat_history[data_human_chat_count[myname]];

          if (msg) {
            data_human_chat_count[myname]++;

            //human msg
            stream.writeSSE({
              data: await html` <div>${msg}</div> `,
              event: "new_msg",
              id: String(sse_count_index++),
            });
          }
        }

        //heartbeat
        // const message = `${myname}, It is ${new Date().toISOString()}  <b>online: ${Object.keys(data_human_chat)}</b>`
        // stream.writeSSE({
        //   data: message + "\n",
        //   event: 'time',
        //   id: String(sse_count_index++),
        // })
      }

      await stream.sleep(3000);

      //the end
    }
  });
});

// app.use(async (c, next) => {
//   console.log(`router: [${c.req.method}] ${c.req.routePath}`)
//   await next()
// })

export default app;
