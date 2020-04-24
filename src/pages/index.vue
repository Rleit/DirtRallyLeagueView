<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-container fluid>
        <v-row align="center">
          <v-col class="d-flex" cols="12" sm="6">
            <v-select
              :items="seasonName"
              label="Seasons"
              v-model="selected"
              :value="seasonName"
              :change="seasonNumbers(selected)"
              dense
              solo
            ></v-select>
          </v-col>
        </v-row>
      </v-container>

      <v-card>
        <seasons :season="seasonNumber" />
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import seasons from "../components/seasons";

import { sheetData } from "../config";

export default {
  components: { seasons },

  data() {
    return {
      seasonName: [],
      selected: sheetData.seasons[0].name,
      seasonNumber: ""
    };
  },
  async fetch() {
    const currentSeason = sheetData.seasons;

    const dataResult = [];

    for (let index = 0; index < currentSeason.length; index++) {
      const element = currentSeason[index];

      // console.log(element.name);
      dataResult.push(element.name);
    }

    this.seasonName = dataResult;

    // console.log(this.seasonName);
  },
  methods: {
    debug(event) {
      console.log(event.target.name);
    },

    seasonNumbers(name) {
      var removedText = name.replace(/\D+/g, "");
      this.seasonNumber = removedText - 1;
    }
  }
};
</script>
