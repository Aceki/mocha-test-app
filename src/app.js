/**
 * @file Создание приложения и подключение промежуточных обработчиков.
 */

import cors from "cors";
import express from "express";
import validator from "validator";

import * as globals from "./globals.js";

const app = express();

const gamesDefaultValue = [
    { name: "Minecraft", description: "Mine and craft." },
    { name: "Assasin's Creed", description: "Kill your enemies." },
    { name: "Terminator", description: "Kiborg ubijca." },
    { name: "Fall Gays", description: "No comment." }
]
let games = [...gamesDefaultValue];

/**
 * Вспомогательная функция для очистки списка игр.
 */
function resetGames() {
    games = [...gamesDefaultValue];
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/games/", (req, res) => {
    if (typeof req.body.name !== "string"
        || !validator.matches(req.body.name, /^[a-zA-Z' \.]+$/)) {
        res.status(422).json({
            message: "Имя игры должно быть строкой и соответствовать шаблону /^[a-zA-Z' \.]+$/.",
            type: "validation"
        });
    }
    else if (typeof req.body.description !== "string"
        || !validator.matches(req.body.description, /^[a-zA-Z' \.]+$/)) {
        res.status(422).json({
            message: "Описание игры игры должно быть строкой и соответствовать шаблону /^[a-zA-Z' \.]+$/.",
            type: "validation"
        });
    }
    else {
        const game = { name: req.body.name, description: req.body.description };
        games.push(game);

        res.setHeader("Location", `${globals.API_URI}/games/${games.length - 1}`);
        res.json(game);
    }
})

app.get("/games", (req, res) => {
    res.json(games);
});

app.get("/games/:gameId", (req, res) => {
    const gameId = validator.toInt(req.params.gameId);
    if (gameId === NaN) {
        res.status(422).json({
            message: "Идентификатор игры должен быть числом.",
            type: "validation"
        });
    }
    else if (gameId < 0 || gameId >= games.length) {
        res.status(404).json({
            message: "Игра с указанным идентификатором не найдена.",
            type: "logic"
        });
    }
    else {
        res.json(games[gameId]);
    }
});

app.get((req, res) => {
    return res.json({
        gamesUrl: `http://${globals.API_URI}/games/{gameId}`
    });
})

app.use((req, res) => {
    res.status(404).json({
        message: "Указанный путь не найден.",
        type: "access"
    })
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        res.status(422).json({
            message: "Тело запроса имеет неверный формат.",
            type: "validation"
        });
    }
    else {
        console.error(err);
        res.status(500).json({
            message: "Произошла неожиданная ошибка.",
            type: "unexpected"
        })
    }
})

export default app;
export { app, resetGames };
