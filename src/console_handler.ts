
import { Transform } from "graph-transform";

export class ConsoleHandler extends Transform<string, never> {

    constructor() {
        super(process.stdout);
    }
}