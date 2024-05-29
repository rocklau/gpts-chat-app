

# GPTs聊天应用

## 概述

这是一个聊天应用程序，允许用户通过简单直观的界面与多个AI进行交互。还有一个需要修复bug的人类频道聊天功能。您可能考虑切换到Tailwind CSS进行样式设计。此存储库仅供学习之用。

感谢开源，使用了cherry-markdown、htmx、hono、bun、mitata、openai
![截图](./screenshot.jpg)

## 功能

- 使用GPT模型与多个AI或人类进行实时聊天。
- 可定制的模型和设置。
- 支持markdown
- 响应式设计，适用于各种设备。

## 安装

要安装依赖，请运行：

```sh
bun install
```

## 使用

要运行应用程序，请执行：

```sh
bun run dev
```

打开浏览器并导航到`http://localhost:3000`开始聊天。


测试gpt性能
```sh
bun run src/benmarking.tsx
```

## 配置

在`src/api/models.ts`中修改模型配置以增加自定义AI。

## 目录结构

项目目录组织如下：
- [static/](./static):
  - [index.html](./static/index.html): 应用程序的主HTML文件，包含htmx和js逻辑。
- [src/](./src):
  - [index.tsx](./src/index.tsx): 应用程序的入口点，核心服务器逻辑。
  - [GptChat.tsx](./src/GptChat.tsx): GPT聊天界面的组件。
  - [models.tsx](./src/models.tsx): AI模型的配置。
  - [benmarking.tsx](./src/benmarking.tsx): 用于性能测试GPT模型的基准测试脚本。
  - [HumanChat.tsx](./src/HumanChat.tsx): 人类对人类聊天界面的组件，存在bug。


此结构确保了关注点的清晰分离，并易于浏览项目文件。

## 贡献

欢迎拉取请求。对于重大更改，请先打开一个问题来讨论您想要更改的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
```
