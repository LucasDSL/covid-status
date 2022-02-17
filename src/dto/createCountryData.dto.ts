export class CreateCountryDataDto {
  pais: string;
  casosHoje: number;
  mortesHoje: number;
  data: string;
  casosAtivos: number;
  casosCriticos: number;
  constructor(countryData) {
    this.pais = countryData.country;
    this.casosHoje = countryData.todayCases;
    this.mortesHoje = countryData.todayDeaths;
    this.data = new Date().toLocaleDateString('pt-BR');
    this.casosAtivos = countryData.active;
    this.casosCriticos = countryData.critical;
  }
}
