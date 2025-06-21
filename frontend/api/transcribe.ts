import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ytdl from 'ytdl-core';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

export const config = {
  api: {
    bodyParser: true,
  },
};

async function downloadAudio(videoUrl: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioStream = ytdl(videoUrl, { filter: 'audioonly' });
    const writeStream = fs.createWriteStream(outPath);
    audioStream.pipe(writeStream);
    audioStream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

async function uploadToAssemblyAI(filePath: string): Promise<string> {
  const file = fs.createReadStream(filePath);
  const response = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/upload',
    headers: {
      authorization: ASSEMBLYAI_API_KEY!,
      'transfer-encoding': 'chunked',
    },
    data: file,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data.upload_url;
}

async function requestTranscript(audioUrl: string): Promise<string> {
  const response = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    { audio_url: audioUrl },
    { headers: { authorization: ASSEMBLYAI_API_KEY! } }
  );
  return response.data.id;
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.status(200).json({ ok: true });
} 