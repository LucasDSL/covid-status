import { Injectable } from '@nestjs/common';
import { schedule } from 'node-cron';
import 'isomorphic-fetch';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async runRoutine(): Promise<void> {
    // Everyday at 10:30 PM run the routine inside the brackets
    schedule('*/20 * * * * *', async () => {
      const data = await this.getCovidStatus(['br', 'us', 'cn', 'ru']);
      console.log(data);
    });
  }

  formatListOfCountriesToURI(countries: string[]): string {
    let listByComma = '';
    countries.forEach((country) => {
      listByComma += country + ',';
    });
    const uriContries = encodeURIComponent(listByComma);
    return uriContries;
  }

  async getCovidStatus(countries: string[]): Promise<object[]> {
    const countriesURI = this.formatListOfCountriesToURI(countries);
    const response = await fetch(
      `https://disease.sh/v3/covid-19/countries/${countriesURI}`,
    );

    return response.json();
  }
}
