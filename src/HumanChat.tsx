import type { FC } from "hono/jsx";

export const HumanChat: FC<{ myname: string }> = (props: {
  myname: string;
}) => {
  return (
    <div>
      <div id="chat" class="flex-container">
        <div class="flex-item">
          <form id="chatForm" hx-post="/chat" hx-target="#server_status">
            <input
              name="myname"
              title="my name"
              type="hidden"
              value={props.myname}
            />
            <textarea name="msg" title="msg"  ></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
      <div class="flex-container">
        <div class="flex-item">
          <div>
            <div hx-sse="swap:new_msg" hx-swap="beforeend"></div>
            server time:
            <div hx-sse="swap:time"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
