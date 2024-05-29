import { run, bench, group, baseline } from "mitata";
import { models_name, models_client } from "./models";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
const _say_hi: ChatCompletionMessageParam = {
  role: "user",
  content: `Hi`,
};
const _say_Chinese: ChatCompletionMessageParam = {
  role: "user",
  content: `Ten words to intro New York City`,
};
async function gpt_first_test(model: string, say: ChatCompletionMessageParam) {
  const completion = await models_client[model].chat.completions.create({
    messages: [say],
    model,
    temperature: 0,
    stream: true,
  });

  for await (const chunk of completion) {
    return chunk.choices[0]?.delta?.content || "";
  }
}
async function gpt_test(model: string, say: ChatCompletionMessageParam) {
  const completion = await models_client[model].chat.completions.create({
    messages: [say],
    model,
    temperature: 0,
    stream: true,
  });
  console.log(model, completion.choices[0].message.content);
  return completion;
}
group("group_the_first_token", () => {
  // baseline("baseline", () => {});
  // bench("Date.now()", () => Date.now());
  // bench("performance.now()", () => performance.now());
  models_name.forEach((m) => {
    bench(m, async () => await gpt_first_test(m, _say_hi));
  });
});

// group("group_b", () => {
//   // baseline("baseline", () => {});
//   // bench("Date.now()", () => Date.now());
//   // bench("performance.now()", () => performance.now());
//   models_name.forEach((m) => {
//     bench(m, async () => await gpt_test(m, _say_Chinese));
//   });
// });

await run({
  units: false, // print small units cheatsheet
  silent: false, // enable/disable stdout output
  avg: true, // enable/disable avg column (default: true)
  json: false, // enable/disable json output (default: false)
  colors: true, // enable/disable colors (default: true)
  min_max: true, // enable/disable min/max column (default: true)
  percentiles: false, // enable/disable percentiles column (default: true)
});
