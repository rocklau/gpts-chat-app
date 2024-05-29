import type { FC } from "hono/jsx";

export const GptChat: FC<{ myname: string; models_name: string[] }> = (props: {
  myname: string;
  models_name: string[];
}) => {
  return (
    <div>
      <div id="gpt_container" class="flex-container">
        {props.models_name.map((m) => {
          return (
            <div class="flex-item">
              <div>
                {m}
                <br />
              </div>
              <div id={m}></div>
            </div>
          );
        })}
      </div>

      <div class="flex-container">
        <div class="flex-item">
          <form id="gptForm" hx-post="/gpt" hx-target="#server_status">
            <input
              id="myname"
              name="myname"
              title="my name"
              type="hidden"
              value={props.myname}
            />
            <textarea id="msg" name="msg" title="msg"   ></textarea>
            <button type="submit">Send</button>
          </form>
        </div>

        
      </div>
      <div id="server_status"></div>
      <hr/>
      <div  style="display:flex;flex-direction: row; flex-wrap: wrap;" id="send_div"></div>
    </div>
  );
};
