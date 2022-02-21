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

  async XwriteFile(data: object[], filename: string) {
    const mappedData = this.mapCovidData(data);

    stringify(mappedData, { header: true }, (err, output) => {
      fs.writeFileSync(path.join(__dirname, filename), output);
    });
  }

  async deleteFiles(files: string[]) {
    files.forEach((file) => {
      fs.unlinkSync(path.join(__dirname, file));
    });
  }

  createFormDataWithFile(fileName: string): FormData {
    const formData = new FormData();
    const file = fs.createReadStream(path.join(__dirname, fileName));
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
