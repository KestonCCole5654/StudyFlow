// Ensure your backend/package.json contains: { "type": "module" }
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import cors from 'cors';
import { createWriteStream, createReadStream, statSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ytdl from 'ytdl-core';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend server is up and running.'
  });
});

async function downloadAudio(videoUrl, outPath) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, {
      quality: 'lowestaudio',
      filter: 'audioonly',
    });

    const writeStream = createWriteStream(outPath);
    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log('Download finished and file written to disk.');
      resolve();
    });

    stream.on('error', (err) => {
      console.error('ytdl stream error:', err);
      reject(new Error('Failed to download audio from YouTube.'));
    });

    writeStream.on('error', (err) => {
      console.error('File write stream error:', err);
      reject(new Error('Failed to save audio file.'));
    });
  });
}

async function uploadToAssemblyAI(filePath) {
  const file = createReadStream(filePath);
  const response = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/upload',
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      'transfer-encoding': 'chunked',
    },
    data: file,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data.upload_url;
}

async function requestTranscript(audioUrl) {
  const response = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    { audio_url: audioUrl },
    { headers: { authorization: ASSEMBLYAI_API_KEY } }
  );
  return response.data.id;
}

app.post('/api/transcribe', async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ error: 'Missing videoUrl' });

  const tempId = uuidv4();
  // Use the /tmp directory for serverless environments
  const audioPath = join('/tmp', `${tempId}.mp3`);

  try {
    console.log('Downloading audio...');
    await downloadAudio(videoUrl, audioPath);
    const stats = statSync(audioPath);
    console.log('Audio file size:', stats.size);
    if (stats.size < 1000) throw new Error('Downloaded audio file is too small.');
    console.log('Uploading to AssemblyAI...');
    const uploadUrl = await uploadToAssemblyAI(audioPath);
    console.log('Requesting transcript...');
    const transcriptId = await requestTranscript(uploadUrl);
    res.status(200).json({ transcriptId });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message || 'Transcription failed' });
  } finally {
    if (existsSync(audioPath)) unlinkSync(audioPath);
  }
});

app.get('/api/transcribe-status', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing transcript id' });

  try {
    const response = await axios.get(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: ASSEMBLYAI_API_KEY },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch transcript status' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}

// For Vercel serverless functions
export default app;