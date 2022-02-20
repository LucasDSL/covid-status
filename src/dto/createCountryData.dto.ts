export class CreateCountryDataDto {
  'país': string;
  'casos hoje': number;
  'mortes hoje': number;
  data: string;
  'casos ativos': number;
  'casos críticos': number;
  constructor(countryData) {
    this['país'] = countryData.country;
    this['casos hoje'] = countryData.todayCases;
    this['mortes hoje'] = countryData.todayDeaths;
    this.data = new Date().toLocaleDateString('pt-BR');
    this['casos ativos'] = countryData.active;
    this['casos críticos'] = countryData.critical;
  }
}
