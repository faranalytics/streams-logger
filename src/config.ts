class Config {

    public defaultHighWaterMark: number;
    public defaultHighWaterMarkObjectMode: number;
    constructor() {        
        this.defaultHighWaterMark = 16384;
        this.defaultHighWaterMarkObjectMode = 16;
    }

    getDefaultHighWaterMark(objectMode: boolean) {
        if (objectMode) {
            return this.defaultHighWaterMarkObjectMode;
        }
        else {
            return this.defaultHighWaterMark;
        }
    }

    setDefaultHighWaterMark(objectMode: boolean, value: number) {
        if (objectMode) {
            this.defaultHighWaterMarkObjectMode = value;
        }
        else {
            this.defaultHighWaterMark = value;
        }
    }
}

export const config = new Config();