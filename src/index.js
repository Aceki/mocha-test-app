/**
 * @file Запуск сервера.
 */

import * as globals from "./globals.js";
import app from "./app.js";

(function () {
    app.listen(
        globals.PORT,
        () => console.log(`Server is running on "${globals.API_URI}".`)
    );
})();

