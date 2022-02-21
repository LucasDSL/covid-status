import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly requiredCountriesId: string[] = ['br', 'us', 'cn', 'ru'],
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async schedule() {
    const data = await this.appService.getCovidStatus(this.requiredCountriesId);
  }
}
