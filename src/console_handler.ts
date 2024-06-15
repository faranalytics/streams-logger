
import { Transform } from "transformative";

export class ConsoleHandler extends Transform<string, never> {

    constructor() {
        super(process.stdout);
    }
}