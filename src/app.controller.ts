import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly requiredCountriesId: string[] = ['br', 'us', 'cn', 'ru'];

  @Cron(CronExpression.EVERY_30_SECONDS)
  async schedule() {
    const data = await this.appService.getCovidStatus(this.requiredCountriesId);

    this.appService.writePairOfCSV(data['data']);

    console.log('writed files');

    let form = this.appService.createFormDataWithFile('brus');
    await this.appService.sendFileToGoFile(form);

    form = this.appService.createFormDataWithFile('cnru');
    await this.appService.sendFileToGoFile(form);

    await this.appService.deletePairOfCSV();
    console.log('done');
  }
}
