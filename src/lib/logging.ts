import {createLogger, format, transports} from "winston";

const myFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.splat(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' })
    ],
});

export default logger;

