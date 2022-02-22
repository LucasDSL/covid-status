import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly requiredCountriesId: string[] = ['br', 'us', 'cn', 'ru'];

  @Cron(CronExpression.EVERY_10_SECONDS)
  async schedule() {
    const data = await this.appService.getCovidStatus(this.requiredCountriesId);
    const countries = await data['data'];
    const fileNames = ['brUsCovidStatus.csv', 'cnRuCovidStatus.csv'];

    // Brazil and Us file
    this.appService.writeFile(await countries.slice(0, 2), fileNames[0]);
    const formBRUS = await this.appService.createFormDataWithFile(fileNames[0]);
    await this.appService.sendFileToGoFile(formBRUS);

    // China and Russia file
    this.appService.writeFile(await countries.slice(2, 4), fileNames[1]);
    const formCNRU = await this.appService.createFormDataWithFile(fileNames[1]);
    await this.appService.sendFileToGoFile(formCNRU);

    await this.appService.deleteFiles(fileNames);
  }
}
