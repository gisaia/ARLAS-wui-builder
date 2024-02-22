/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
export const CIRCLE_HEATMAP_RADIUS_GRANULARITY = {
  geohash: {
    finest: [
      0, 9,
      2.9999999999999, 25,
      3, 9,
      4.9999999999999, 12,
      5, 4,
      7.9999999999999, 20,
      8, 10,
      10.9999999999999, 25,
      11, 60,
      13.9999999999999, 200,
      14, 200,
      16.9999999999999, 1000,
      17, 1000,
      19.9999999999999, 1500,
      20, 2000
    ],
    fine: [
      0, 10,
      1.999, 20,
      4.999999, 60,
      5, 30,
      7.999999, 120,
      8, 40,
      10.499999, 180,
      10.5, 30,
      13.999999, 210,
      14, 300,
      16.999999, 1000,
      17, 2000
    ],
    medium: [
      0, 10,
      2.999999, 90,
      3, 30,
      5.999999, 130,
      6, 40,
      8.999999, 200,
      9, 50,
      11.999999, 360,
      12, 70,
      14.999999, 460,
      15, 600,
      17, 2000
    ],
    coarse: [
      0, 30,
      3.999999, 250,
      4, 50,
      6.999999, 300,
      7, 120,
      9.999999, 480,
      10, 120,
      12.999999, 580,
      13, 160,
      14, 600,
      17, 1000
    ],
  },
  tile: {
    finest: [0,9, 23,15],
    fine: [0, 35, 23,45],
    medium: [0, 50, 23, 100],
    coarse: [0, 80, 23,150]
  }
};
