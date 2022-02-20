/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { stringify } from 'csv-stringify';
import * as fs from 'fs';
import * as FormData from 'form-data';
import axios from 'axios';
import { CreateCountryDataDto } from './dto/createCountryData.dto';
import 'isomorphic-fetch';

@Injectable()
export class AppService {
  requiredCountriesId: string[] = ['br', 'us', 'cn', 'ru'];

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
    return axios.get(
      `https://disease.sh/v3/covid-19/countries/${countriesURI}`,
    );
  }

  mapCovidData(data: object[]): CreateCountryDataDto[] {
    const mappedData = data.map(
      (countryData) => new CreateCountryDataDto(countryData),
    );
    return mappedData;
  }

  writePairOfCSV(data: object[]) {
    const mappedData = this.mapCovidData(data);

    stringify(mappedData.slice(2, 4), { header: true }, (err, output) => {
      fs.writeFileSync(path.join(__dirname, `cnRuStatus.csv`), output);
    });

    stringify(mappedData.slice(0, 2), { header: true }, (err, output) => {
      fs.writeFileSync(path.join(__dirname, `brUsStatus.csv`), output);
    });
  }

  async deletePairOfCSV() {
    fs.unlinkSync(path.join(__dirname, `brUsStatus.csv`));
    fs.unlinkSync(path.join(__dirname, `cnRuStatus.csv`));
  }

  createFormDataWithFile(option: string): FormData {
    const formData = new FormData();
    let file;
    if (option == 'brus') {
      file = fs.createReadStream(path.join(__dirname, `brUsStatus.csv`));
    } else {
      file = fs.createReadStream(path.join(__dirname, `cnRuStatus.csv`));
    }
    formData.append('file', file);
    formData.append('token', process.env.go_file_key);
    formData.append('folderId', process.env.covid_status_folder_id);
    return formData;
  }

  async sendFileToGoFile(formData: FormData) {
    try {
      const response = await axios.get('https://api.gofile.io/getServer');
      const server = await response['data']['data']['server'];

      await axios.post(`https://${server}.gofile.io/uploadFile`, formData, {
        headers: formData.getHeaders(),
      });
    } catch (error) {
      console.log(error);
    }
  }
}
