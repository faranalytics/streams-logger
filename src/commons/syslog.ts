export enum SyslogLevel {
  EMERG = 0,
  ALERT = 1,
  CRIT = 2,
  ERROR = 3,
  WARN = 4,
  NOTICE = 5,
  INFO = 6,
  DEBUG = 7,
}

export type SyslogLevelT = typeof SyslogLevel;