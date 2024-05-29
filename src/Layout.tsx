import type { FC } from "hono/jsx";

export const Layout: FC = (props) => {
  return <>{props.children}</>;
};
