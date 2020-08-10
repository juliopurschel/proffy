import { Router } from 'express';
import db from '../database/connection';
import convertHourToMinutes from '../utils/covertHourToMinuts';

const classesRoutes = Router();

interface IScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

classesRoutes.post('/', async (request, response) => {
  const { name, avatar, whatsapp, bio, subject, cost, schedule } = request.body;
  const trx = await db.transaction();
  try {
    const isertedUsersIds = await trx('users').insert({ name, avatar, whatsapp, bio });
    const user_id = isertedUsersIds[0];
    const insertedClassesIds = await trx('classes').insert({ subject, cost, user_id });
    const class_id = insertedClassesIds[0];
    const class_schedule = schedule.map((schedule_item: IScheduleItem) => {
      return {
        class_id,
        week_day: schedule_item.week_day,
        from: convertHourToMinutes(schedule_item.from),
        to: convertHourToMinutes(schedule_item.to),
      };
    });

    await trx('class_schedule').insert(class_schedule);
    await trx.commit();

    return response.status(201).send();
  } catch (err) {
    await trx.rollback();
    return response.status(400).json({ error: 'Unexpected error while creating new class.' });
  }
});

classesRoutes.get('', async (request, response) => {
  const filters = request.query;

  const subject = filters.subject as string;
  const week_day = filters.week_day as string;
  const time = filters.time as string;

  if (!filters.week_day || !filters.subject || !filters.time) {
    return response.status(400).json({
      error: 'Missing filters to search class',
    });
  }

  const timeEndMinuts = convertHourToMinutes(time);

  const classes = await db('classes')
    .whereExists(function () {
      this.select('class_schedule.*')
        .from('class_schedule')
        .whereRaw(' `class_schedule`.`class_id` = `classes`.`id` ')
        .whereRaw(' `class_schedule`.`week_day` = ?? ', [Number(week_day)])
        .whereRaw(' `class_schedule`.`from` <= ??', [timeEndMinuts])
        .whereRaw(' `class_schedule`.`to` > ??', [timeEndMinuts]);
    })
    .where('classes.subject', '=', subject)
    .join('users', 'classes.user_id', '=', 'users.id')
    .select(['classes.*', 'users.*']);

  return response.json(classes);
});

export default classesRoutes;
