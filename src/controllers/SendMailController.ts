/* eslint-disable camelcase */
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';
import UsersRepository from '../repositories/UsersRepositoy';
import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUsersRepository from '../repositories/SurveysUsersRepository';
import sendMailService from '../services/SendMailService';

class SendMailController {
  static async execute(req: Request, res: Response) {
    const { email, survey_id } = req.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });

    if (!user) return res.status(400).json({ error: 'User doesn\'t exists' });

    const survey = await surveysRepository.findOne({ id: survey_id });

    if (!survey) return res.status(400).json({ error: 'Survey doesn\'t exists' });

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      user_id: user.id,
      link: process.env.URL_MAIL,
    };

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{ user_id: user.id }, { value: null }],
      relations: ['user', 'survey'],
    });

    if (surveyUserAlreadyExists) {
      await sendMailService.execute(email, survey.title, variables, npsPath);
      return res.json(surveyUserAlreadyExists);
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    });

    await surveysUsersRepository.save(surveyUser);

    await sendMailService.execute(email, survey.title, variables, npsPath);

    return res.status(201).json(surveyUser);
  }
}

export default SendMailController;
