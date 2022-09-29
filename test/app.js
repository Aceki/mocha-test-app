/**
 * @file Тестирование REST API.
 */

import { assert } from "chai";

import axios from "./axios.js";
import { app, resetGames } from "../src/app.js";

let server = null;

// Задаём фукнцию, которая будет выполняться перед каждым тестом.
beforeEach(function () {
    if (server !== null) {
        server.close();
    }

    resetGames();

    server = app.listen(3000);
});

describe("Games", function () {
    // Тестируем API для создания игр.
    describe("CreateGame", function () {
        {
            const bodyArray = [
                { nname: "MyGame", description: "Description" },
                { name: "MyGame", descr2iption: "Description." },
                { name: "MyGame" },
                { name: "\\MyGame", description: "Description" },
                { name: "", description: "23" },
                { name: "\\MyGame", description: "\n" },
                { name: 2343, description: "Description" },
                { name: "MyGame", description: 22 },
                {}
            ];
            for (let i = 0; i < bodyArray.length; ++i) {
                it(`Failed_WhenBodyIncorrect_${i}`, async function () {
                    const body = bodyArray[i];
                    const response = await axios.post("/games", body);

                    assert.equal(response.status, 422);
                    assert.hasAllKeys(response.data, [ "message", "type" ]);
                    assert.equal(response.data.type, "validation");
                });
            }
        }

        {
            const bodyArray = [
                "",
                '{ name: "MyGame", "description": "Description" }',
                '{ "name": "MyGame, "description": "Description" }',
                "223423",
            ];
            for (let i = 0; i < bodyArray.length; ++i) {
                it(`Failed_WhenInvalidJSON_${i}`, async function () {
                    const body = bodyArray[i];
                    const response = await axios.post(
                        "/games",
                        body,
                        {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    assert.equal(response.status, 422);
                    assert.hasAllKeys(response.data, [ "message", "type" ]);
                    assert.equal(response.data.type, "validation");
                });
            }
        }

        {
            const contentTypes = [
                "222",
                "asdf",
                "video/mp4",
                "text/plain",
                "text/html",
            ];
            for (let i = 0; i < contentTypes.length; ++i) {
                it(`Failed_WhenInvalidContentType_${i}`, async function () {
                    const response = await axios.post(
                        "/games",
                        { name: "MyGame", "description": "Description." },
                        {
                            headers: {
                                "Content-Type": contentTypes[i]
                            }
                        }
                    );

                    assert.equal(response.status, 422);
                    assert.hasAllKeys(response.data, [ "message", "type" ]);
                    assert.equal(response.data.type, "validation");
                });
            }
        }

        it("Succeed_WhenBodyCorrect", async function () {
            const body = { name: "MyGame", description: "description" };
            const response = await axios.post("/games", body);

            assert.equal(response.status, 200);
            assert.hasAnyKeys(response.headers, "location");
            assert.hasAllKeys(response.data, [ "name", "description" ]);
            assert.strictEqual(response.data.name, "MyGame");
            assert.strictEqual(response.data.description, "description");
        });
    });

    describe("GetGames", function () {
        it("ReturnedActualGames", async function () {
            const response = await axios.get("games");

            assert.equal(response.status, 200);
            assert.isArray(response.data);
            assert.equal(response.data.length, 4) // В файле `src/app.js` определено четыре игры.
            assert.deepStrictEqual(
                response.data,
                [
                    { name: "Minecraft", description: "Mine and craft." },
                    { name: "Assasin's Creed", description: "Kill your enemies." },
                    { name: "Terminator", description: "Kiborg ubijca." },
                    { name: "Fall Gays", description: "No comment." }
                ]
            );
        })
    });

    describe("GetGame", function () {
        it("Failed_WhenGameDoesNotExists", async function () {
            const response = await axios.get("/games/2893");

            assert.equal(response.status, 404);
            assert.hasAllKeys(response.data, ["message", "type"]);
            assert.equal(response.data.type, "logic");
        });

        it("Succeed_WhenGameCreated", async function () {
            const createGameResponse = await axios.post(
                "/games",
                { name: "MyGame", description: "description" }
            );

            const getGameResponse = await axios.get(createGameResponse.headers["location"]);

            assert.equal(getGameResponse.status, 200);
            assert.hasAllKeys(getGameResponse.data, [ "name", "description" ]);
            assert.strictEqual(getGameResponse.data.name, "MyGame");
            assert.strictEqual(getGameResponse.data.description, "description");
        });
    });
})
