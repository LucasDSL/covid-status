<div align= "center";"><h2>Covid Status Application</h2></div>

<div align= "center"><h2 >Tech used</h2></div>

<div align= "center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="60" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-plain.svg" width="60"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain-wordmark.svg" width="60"/>
</div>

Application that gets data about covid on some countries from the [disease.sh covid data API](https://disease.sh/docs/#/), treat the data, create csv files locally with a pair of countries and send it to the cloud within the [GoFile](https://gofile.io/welcome), then deletes it locally, as shown by the following image. For more details, keep reading this README.

</div>

```ts
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

```
