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
      console.error('下载失败:', e);
      // 如果fetch失败（可能是CORS问题），尝试直接打开图片
      console.log('尝试直接打开图片URL');
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      // 如果还是失败，提示用户
      setTimeout(() => {
        if (confirm('自动下载失败，是否在新窗口打开图片以便手动保存？')) {
          window.open(url, '_blank');
        }
      }, 500);
    });
}
