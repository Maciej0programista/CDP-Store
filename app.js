import express from 'express';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appsPath = path.join(__dirname, 'apps');

marked.setOptions({
    highlight: (code) => hljs.highlightAuto(code).value,
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/apps/:appName/app', async (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(appsPath, appName, `${appName}.zip`);

    try {
        const data = await fs.readFile(appPath);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${appName}.zip"`);
        res.send(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).send('Aplikacja nie znaleziona.');
        }
        console.error("Błąd:", err);
        return res.status(500).send('Błąd serwera: ' + err.message);
    }
});

app.get('/apps/:appName/description', async (req, res) => {
    const appName = req.params.appName;
    const descriptionPath = path.join(appsPath, appName, 'app.md');

    try {
        const data = await fs.readFile(descriptionPath, 'utf8');
        const html = marked.parse(data);
        res.send(html);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.send('');
        }
        console.error("Błąd:", err);
        return res.status(500).send('Błąd serwera: ' + err.message);
    }
});

app.get('/', (req, res) => {
    res.send('Serwer CatDeveloper działa!');
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Słucham na porcie ${port}`);
});
