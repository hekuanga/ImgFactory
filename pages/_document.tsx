import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang='zh-CN'>
        <Head>
          <link rel='icon' href='/favicon.ico' />
          <meta
            name='description'
            content='修复您的旧照片，让珍贵回忆重获新生。'
          />
          <meta property='og:site_name' content='照片修复工具' />
          <meta
            property='og:description'
            content='修复您的旧照片，让珍贵回忆重获新生。'
          />
          <meta property='og:title' content='面部照片修复工具' />
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:title' content='面部照片修复工具' />
          <meta
            name='twitter:description'
            content='修复您的旧照片，让珍贵回忆重获新生。'
          />
          <meta
            property='og:image'
            content='https://restore-photos.vercel.app/og-image.png'
          />
          <meta
            name='twitter:image'
            content='https://restore-photos.vercel.app/og-image.png'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
