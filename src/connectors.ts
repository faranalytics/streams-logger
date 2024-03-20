import { Connector } from ".";


/**
 * - Input: `<string>`
 * - Output: `<never>` 
 */
export class StringToConsole extends Connector<string, never> {
    constructor() {
        super(process.stdout);
    }
}

