/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { schedule } from 'node-cron';
import { stringify } from 'csv-stringify';
import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { CreateCountryDataDto } from './dto/createCountryData.dto';
import 'isomorphic-fetch';

@Injectable()
export class AppService {
  requiredCountriesId: string[] = ['br', 'us', 'cn', 'ru'];

  async runRoutine(): Promise<void> {
    // Everyday at 10:30 PM run the routine inside the brackets
    // 0 30 22 1/1 * *
    schedule('*/10 * * * * *', async () => {
      const data = await this.getCovidStatus(this.requiredCountriesId);
      const filteredData = this.mapCovidData(data);
      const timestamp = new Date().getTime();
      this.writePairOfCSV(filteredData, timestamp);
      const formData = this.createFormDataWithFile(timestamp);
      await this.sendFileToGoFile(formData);
      // Keep deletion at end of routine for perfomance
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

  mapCovidData(data: object[]): CreateCountryDataDto[] {
    const mappedData = data.map(
      (countryData) => new CreateCountryDataDto(countryData),
    );
    return mappedData;
  }

  writePairOfCSV(listData: CreateCountryDataDto[], timestamp: number) {
    stringify(listData.slice(0, 2), { header: true }, (err, output) => {
      fs.writeFileSync(`./${timestamp}br-us-covid-status.csv`, output);
    });

    stringify(listData.slice(2, 4), { header: true }, (err, output) => {
      fs.writeFileSync(`./${timestamp}cn-ru-covid-status.csv`, output);
    });
  }

  async deletePairOfCSV(timestamp: number) {
    fs.unlinkSync(`./${timestamp}br-us-covid-status.csv`);
    fs.unlinkSync(`./${timestamp}cn-ru-covid-status.csv`);
  }

  createFormDataWithFile(timestamp: number): FormData {
    const formData = new FormData();
    const file = fs.createReadStream(`./${timestamp}br-us-covid-status.csv`);
    formData.append('file', file);
    formData.append('token', process.env.goFileKey);
    formData.append('folderId', process.env.covid_status_folder_id);
    console.log('form created!');
    return formData;
  }

  async sendFileToGoFile(formData: FormData) {
    await axios.post(`https://store4.gofile.io/uploadFile`, formData, {
      headers: formData.getHeaders(),
    });
  }
}
