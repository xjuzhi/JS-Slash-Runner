/**
 * 加载 CSS 或 JS 文件，并将其附加到相应的文档部分。修改自SillyTavern的loadFileToDocument
 * CSS文件将作为内联<style>标签插入，JS文件依然作为<script>标签插入
 *
 * @param {string} url - 要加载的文件的 URL。
 * @param {string} type - 要加载的文件类型："CSS" 或 "JS"
 * @param {string} id - 要设置的元素的 ID。
 */

export async function loadFileToHead(url: string, type: 'css' | 'js', id?: string) {
  return new Promise((resolve, reject) => {
    if (type === 'css') {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(cssContent => {
          if (id) {
            const existingStyle = document.getElementById(id);
            if (existingStyle) {
              existingStyle.remove();
            }
          }

          const styleElement = document.createElement('style');
          styleElement.textContent = cssContent;

          if (id) {
            const cleanId = id.toString().replace(/[^a-z0-9_-]/gi, '_');
            styleElement.id = cleanId;
          }

          document.head.appendChild(styleElement);
          resolve(styleElement);
        })
        .catch(error => {
          reject(error);
        });
    } else if (type === 'js') {
      const element = document.createElement('script');
      element.src = url;

      if (id) {
        const cleanId = id.toString().replace(/[^a-z0-9_-]/gi, '_');
        element.id = cleanId;
      }

      element.onload = resolve;
      element.onerror = reject;

      document.body.appendChild(element);
    } else {
      reject('Invalid type specified');
    }
  });
}
