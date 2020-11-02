import * as RacingEnumObjects from '../../share/models/comm-serv/Racing/Enums';

export function getWeekDayCode(dateStr: string): RacingEnumObjects.RaceDayCode {
    if (dateStr === undefined) {
        return RacingEnumObjects.RaceDayCode.NO_DAY_MARK;
    }
    let week: RacingEnumObjects.RaceDayCode;
    const date = new Date(
        dateStr
            .replace(/\//g, '')
            .replace(/^(\d{2})(\d{2})(\d{4})$/, '$3-$2-$1')
    );
    if (date.getDay() === 0) {
        week = RacingEnumObjects.RaceDayCode.SUNDAY;
    }
    if (date.getDay() === 1) {
        week = RacingEnumObjects.RaceDayCode.MONDAY;
    }
    if (date.getDay() === 2) {
        week = RacingEnumObjects.RaceDayCode.TUESDAY;
    }
    if (date.getDay() === 3) {
        week = RacingEnumObjects.RaceDayCode.WEDNESDAY;
    }
    if (date.getDay() === 4) {
        week = RacingEnumObjects.RaceDayCode.THURSDAY;
    }
    if (date.getDay() === 5) {
        week = RacingEnumObjects.RaceDayCode.FRIDAY;
    }
    if (date.getDay() === 6) {
        week = RacingEnumObjects.RaceDayCode.SATURDAY;
    }
    return week;
}

export function getWeekDayString(daycode: number): string {
    let dayStr = '';
    switch (daycode) {
        case 0: {
            dayStr = 'SUN';
            break;
        }
        case 1: {
            dayStr = 'MON';
            break;
        }
        case 2: {
            dayStr = 'TUE';
            break;
        }
        case 3: {
            dayStr = 'WED';
            break;
        }
        case 4: {
            dayStr = 'THU';
            break;
        }
        case 5: {
            dayStr = 'FRI';
            break;
        }
        case 6: {
            dayStr = 'SAT';
            break;
        }
        default:
            break;
    }
    return dayStr;
}
