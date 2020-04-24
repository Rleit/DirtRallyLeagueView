<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">Driver</th>
          <th
            v-for="event in events"
            :key="event.name + Math.random()"
            class="text-left"
          >{{event.name}}</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in sData.values" :key="item[0]">
          <td v-for="points in item" :key="points + Math.random()">{{ points }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import api from "../plugins/axiosapi";
import { key, sheetData } from "../config/index";

export default {
  props: ["season"],

  data() {
    return {
      sData: "",
      events: "",
      currentSeason: ""
    };
  },
  watch: {
    season: {
      // the callback will be called immediately after the start of the observation
      immediate: true,
      async handler(val, oldVal) {
        this.currentSeason = val;

        const currentSeason = sheetData.seasons[this.currentSeason];
        this.events = currentSeason.events;

        const sData = await this.$gApi
          .seasons({
            id: currentSeason.sheetID,
            sheet: currentSeason.sheet,
            range: currentSeason.range
          })
          .catch(error => console.log(error));

        this.sData = sData;

        // console.log(this.sData);
      }
    }
  },
  asyncData() {
    /* this.events = sheetData.seasons[this.season].events; */
  },

  mounted() {
    /* console.log(this.events); */
  },
  async fetch() {
    const currentSeason = sheetData.seasons[this.currentSeason];
    this.events = currentSeason.events;

    const sData = await this.$gApi
      .seasons({
        id: currentSeason.sheetID,
        sheet: currentSeason.sheet,
        range: currentSeason.range
      })
      .catch(error => console.log(error));

    this.sData = sData;
  },

  methods: {}
};
</script>
