const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const corsOptions = {
  origin: '*', // ou defina as origens permitidas explicitamente
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(express.json()); // Middleware para processar JSON no corpo das solicitações


app.use(cors());
app.use(express.static('public'));
app.use(express.json()); // Middleware para processar JSON no corpo das solicitações


app.post('/download', async (req, res) => {
  const videoUrl = req.body.videoUrl; // Obtenha a URL do vídeo do corpo da solicitação

  // Verifique se a URL do vídeo do YouTube é válida
  if (!ytdl.validateURL(videoUrl)) {
    const response = {
      message: 'URL do YouTube inválida',
    };
    return res.status(400).json(response);
  }

  try {
    // Obtenha informações do vídeo, incluindo o título
    const info = await ytdl.getInfo(videoUrl);

    // Use o título do vídeo como o nome do arquivo
    const outputFile = info.videoDetails.title.replace(/[\\/:*?"<>|]+/g, "_") + '.mp3'; // Substitua caracteres inválidos

    // Lógica para download do áudio no formato MP3
    const options = {
      quality: 'highestaudio',
      filter: 'audioonly', // Baixar apenas o áudio
    };

    const videoStream = ytdl(videoUrl, options);

    const fileStream = fs.createWriteStream(outputFile);

    videoStream.pipe(fileStream);

    videoStream.on('end', () => {
      // Configura o cabeçalho do tipo de conteúdo para "audio/mpeg"
      res.setHeader('Content-Type', 'audio/mpeg');

      // Envia o arquivo de áudio como resposta
      const audioFileStream = fs.createReadStream(outputFile);
      audioFileStream.pipe(res);

      // Exibe uma mensagem de confirmação no navegador
      const confirmationMessage = 'Download concluído!';
      res.setHeader('X-Confirmation-Message', confirmationMessage);
    });

    videoStream.on('error', (error) => {
      const response = {
        message: `Erro durante o download: ${error.message}`,
      };
      res.status(500).json(response);
    });
  } catch (error) {
    const response = {
      message: `Erro ao obter informações do vídeo: ${error.message}`,
    };
    res.status(500).json(response);
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});