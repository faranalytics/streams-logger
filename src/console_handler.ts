
import { Transform } from "./transform";

export class ConsoleHandler extends Transform<string, never> {

    constructor() {
        super(process.stdout);
    }
}