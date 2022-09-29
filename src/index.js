import * as globals from "./globals.js";
import app from "./app.js";

(function () {
    app.listen(
        globals.PORT,
        () => console.log(`Server is running on localhost:${globals.PORT}`)
    );
})();

