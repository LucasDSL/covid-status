import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly requiredCountriesId: string[] = ['br', 'us', 'cn', 'ru'];

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async writeFile() {
    const data = await this.appService.getCovidStatus(this.requiredCountriesId);
    const countriesData = await data['data'];
    const files = ['brUsCovidStatus.csv 1', 'cnRuCovidStatus 2'];

    files.forEach((file) => {
      const fileInfo = file.split(' ');
      let countries;
      if (fileInfo[1] === '1') {
        countries = countriesData.slice(0, 2);
      } else {
        countries = countriesData.slice(2, 4);
      }
      this.appService.writeFile(countries, fileInfo[0]);
    });
  }

  // Five minutes later...
  @Cron('0 5 23 1/1 * *')
  async sendFilesCloud() {
    const files = ['brUsCovidStatus.csv', 'cnRuCovidStatus'];

    files.forEach(async (file) => {
      const form = await this.appService.createFormDataWithFile(file);
      await this.appService.sendFileToGoFile(form);
    });

    await this.appService.deleteFiles(files);
  }
}
