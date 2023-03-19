<div align="center">

# QWechat-ChatGPT
  
旨在支持微信 & QQ 双端统一的 ChatGPT 机器人，基于 NestJs + TypeScript + Wechaty 实现。

</div>

### 🎉Features
- [x]  微信私聊
- [ ]  微信群里艾特支持
- [ ]  QQ 支持

> QQ 端开发中...
### 🚀快速上手

#### 安装依赖
```shell
pnpm install
```

#### 配置环境变量

在根目录下新建一个 .env 文件，内容如下：
```env
OPENAI_API_KEY=
HTTPS_PROXY=http://127.0.0.1:7890
```

- `OPENAI_API_KEY`(必选): 你的 openAI Api Key。
- `HTTPS_PROXY`（可选）: 配置代理访问 openAi API 接口。


#### 启动项目
npm run start

#### 登录微信账号
![Terminal](https://blog-images-1257398419.cos.ap-nanjing.myqcloud.com/picgo20230319172045.png) 

扫码登录即可，如果码是扫不了的（一般是 Web 会乱），可以点开上面的链接进行登录。

完成以上步骤后，你的微信就成功变成一个 ChatGPT 机器人了。
