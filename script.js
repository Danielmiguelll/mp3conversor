document.addEventListener('DOMContentLoaded', () => {
  const videoUrlInput = document.getElementById('videoUrl');
  const downloadButton = document.getElementById('downloadButton');
  const status = document.getElementById('status');

  downloadButton.addEventListener('click', () => {
    const videoUrl = videoUrlInput.value;

    if (isValidYouTubeUrl(videoUrl)) {
      status.textContent = 'Iniciando o download...';

      fetch('http://localhost:3000/download', {
        method: 'POST',
        body: JSON.stringify({ videoUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          const contentType = response.headers.get('Content-Type');

          if (contentType && contentType.includes('audio/mpeg')) {
            // A resposta é um arquivo MP3, inicie o download
            const confirmationMessage = response.headers.get('X-Confirmation-Message');
            if (confirmationMessage) {
              alert(confirmationMessage); // Exibe a mensagem de confirmação
            }

            response.blob().then(blob => {
              // Cria um objeto Blob URL
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'CADEAU.mp3';
              document.body.appendChild(a);
              a.click();

              // Libere o objeto Blob URL
              window.URL.revokeObjectURL(url);
            });
          } else {
            throw new Error('Resposta não é um arquivo MP3');
          }
        })
        .catch(error => {
          status.textContent = `Erro durante o download: ${error.message}`;
        });
    } else {
      status.textContent = 'URL do YouTube inválida';
    }
  });

  function isValidYouTubeUrl(url) {
    // Padronize a URL para garantir que todos os caracteres estejam em minúsculas
    url = url.toLowerCase();
  
    return /youtube\.com|youtu\.be/.test(url);
  }
});
function isValidYouTubeUrl(url) {
  // Padronize a URL para garantir que todos os caracteres estejam em minúsculas
  url = url.toLowerCase();

  // Verifique se a URL corresponde a um vídeo do YouTube para desktop
  const desktopPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&.*)?$/;

  // Verifique se a URL corresponde a um vídeo do YouTube para dispositivos móveis
  const mobilePattern = /^(https?:\/\/)?m\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&.*)?$/;

  // Verifique se a URL é uma URL encurtada do YouTube (youtu.be)
  const shortPattern = /^(https?:\/\/)?youtu\.be\/[A-Za-z0-9_-]+(\?.*)?$/;

  // Verifique se a URL corresponde a um vídeo incorporado
  const embedPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]+(&.*)?$/;

  return (
    desktopPattern.test(url) ||
    mobilePattern.test(url) ||
    shortPattern.test(url) ||
    embedPattern.test(url)
  );
}



// Exemplos de uso:
console.log(isValidYouTubeUrl('https://www.youtube.com/watch?v=LcWobod4B2Y&ab_channel=VariousArtists-Topic')); // Válido para desktop
console.log(isValidYouTubeUrl('https://m.youtube.com/watch?v=LcWobod4B2Y&ab_channel=VariousArtists-Topic')); // Válido para dispositivos móveis
console.log(isValidYouTubeUrl('https://www.example.com')); // Inválido 