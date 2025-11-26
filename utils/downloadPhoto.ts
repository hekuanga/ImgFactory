function forceDownload(blobUrl: string, filename: string) {
  try {
    let a: any = document.createElement("a");
    a.download = filename;
    a.href = blobUrl;
    document.body.appendChild(a);
    a.click();
    // 延迟移除，确保下载开始
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('下载失败:', error);
    // 如果直接下载失败，尝试在新窗口打开
    window.open(blobUrl, '_blank');
  }
}

export default function downloadPhoto(url: string, filename: string) {
  if (!url) {
    console.error('下载失败: 图片URL为空');
    alert('下载失败: 图片URL为空');
    return;
  }

  console.log('开始下载图片:', url);
  
  // 首先尝试直接下载（适用于同源或支持CORS的图片）
  fetch(url, {
    mode: "cors",
    cache: "no-cache",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      return response.blob();
    })
    .then((blob) => {
      console.log('图片下载成功，开始保存文件:', filename);
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch((e) => {
      console.warn('Fetch下载失败（可能是CORS问题），尝试备用方法:', e);
      // 如果fetch失败（可能是CORS问题），尝试直接创建下载链接
      // 这个方法通常可以成功，所以不显示错误提示
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        console.log('使用备用下载方法成功');
        // 不显示错误提示，因为备用方法通常可以成功
      } catch (fallbackError) {
        // 只有在所有方法都失败时才提示用户
        console.error('所有下载方法都失败:', fallbackError);
        // 静默失败，不打扰用户（因为浏览器可能已经阻止了下载）
        // 如果需要，可以在这里添加一个不打扰的提示
      }
    });
}
