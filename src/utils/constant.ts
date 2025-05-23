export const BASE_URL = 'http://192.168.1.106:8000/api/v1';  //local
// export const BASE_URL = 'http://13.203.156.169:8000/api/v1';  //aws

export const BACKEND_URL = 'http://192.168.1.106:8000';
// export const BACKEND_URL = 'http://13.203.156.169:8000';  //aws

export const STEAM_API_KEY = 'jdxc5xkrtqfs';


export const VIDEO_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    icon: 'circle',
    matrix: null, // No filter applied
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: 'sun',
    matrix: [
  1.05, 0,    0,    0, 0,
  0,    1.02, 0,    0, 0,
  0,    0,    0.95, 0, 0,
  0,    0,    0,    1, 0,
]

  },
  {
    id: 'cool',
    name: 'Cool',
    icon: 'cloud-snow',
    matrix: [
      0.8, 0, 0, 0, 0,
      0, 1.0, 0, 0, 0,
      0, 0, 1.2, 0, 0.1,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: 'film',
    matrix: [
      0.95, 0, 0, 0, 0.05,
      0.65, 0, 0, 0, 0.15,
      0.15, 0, 0, 0, 0.5,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'monochrome',
    name: 'B&W',
    icon: 'eye',
    matrix: [
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    icon: 'sunset',
    matrix: [
      1.5, 0, 0, 0, 0,
      0, 1.5, 0, 0, 0,
      0, 0, 1.5, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
];

export const IMAGE_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    icon: 'circle',
    matrix: [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ],
  },
{
  id: 'soft',
  name: 'Soft',
  icon: 'feather',
  matrix: [
    0.95, 0.05, 0.05, 0, 0.01176,
    0.05, 0.95, 0.05, 0, 0.01176,
    0.05, 0.05, 0.95, 0, 0.01176,
    0,    0,    0,    1, 0,
  ]
},
{
  id: 'cinematic',
  name: 'Cinema',
  icon: 'film',
  matrix: [
    1.2, -0.05, -0.1, 0, 0,
    -0.1, 1.1, -0.1, 0, 0,
    -0.05, 0.05, 1.3, 0, 0,
    0, 0, 0, 1, 0,
  ],
},
  {
    id: 'vintage',
    name: 'Vintage',
    icon: 'camera',
    matrix: [
      0.6, 0.3, 0.1, 0, 0,
      0.2, 0.7, 0.1, 0, 0,
      0.1, 0.2, 0.7, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'sepia',
    name: 'Sepia',
    icon: 'sun',
    matrix: [
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
  id: 'inverted',
  name: 'Inverted',
  icon: 'refresh-cw', // Placeholder icon, suggest something indicating reversal
  matrix: [
  // R   G   B   A  Offset
   -1,  0,  0,  0,  1,  // Red output: -1*R + 1
    0, -1,  0,  0,  1,  // Green output: -1*G + 1
    0,  0, -1,  0,  1,  // Blue output: -1*B + 1
    0,  0,  0,  1,  0,  // Alpha output: 1*A (no change)
  ]
},
  {
    id: 'grayscale',
    name: 'B&W',
    icon: 'moon',
    matrix: [
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'cool',
    name: 'Cool',
    icon: 'wind',
    matrix: [
      0.8, 0, 0.2, 0, 0,
      0, 0.9, 0.1, 0, 0,
      0, 0, 1.2, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: 'sun',
    matrix:[
  1.2, 0,   0,   0, 0.1,   // Red channel: amplified and biased slightly
  0,   1.0, 0,   0, 0.05,  // Green channel: unchanged with a small bias
  0,   0,   0.8, 0, 0,     // Blue channel: dimmed
  0,   0,   0,   1, 0      // Alpha channel: unchanged
],
  },
  {
    id: 'dramatic',
    name: 'Drama',
    icon: 'zap',
    matrix: [
      1.5, 0, 0, 0, 0,
      0, 1.5, 0, 0, 0,
      0, 0, 1.5, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
  id: 'tealOrange',
  name: 'Teal & Orange',
  icon: 'film', // Placeholder icon
  matrix: [
  // R   G    B    A  Offset
    1.2, -0.1, -0.1, 0, 0,    // Red output: Emphasize R, pull G & B towards orange
    -0.05,1.05, -0.1, 0, 0,    // Green output: Slight shift, maintain green
    -0.2, 0.2,  1.0, 0, 0.02, // Blue output: Push towards teal (add G, reduce B slightly), slight lift
    0,    0,    0,   1, 0,    // Alpha
  ]
},
  {
  id: 'moody',
  name: 'Moody',
  icon: 'cloud',
  matrix: [
    1.1, 0,   0,   0, -0.0196,
    0,   1.1, 0,   0, -0.0196,
    0,   0,   1.1, 0, -0.0196,
    0,   0,   0,   1, 0,
  ],
},

{
  id: 'pastel',
  name: 'Pastel',
  icon: 'droplet',
  matrix: [
    1.05, 0,    0,    0, 0.0235,
    0,    1.02, 0,    0, 0.0235,
    0,    0,    1.0,  0, 0.0235,
    0,    0,    0,    1, 0,
  ],
},
{
  id: 'matte',
  name: 'Matte',
  icon: 'square',
  matrix: [
    0.8, 0,   0,   0, 0.0784,
    0,   0.8, 0,   0, 0.0784,
    0,   0,   0.8, 0, 0.0784,
    0,   0,   0,   1, 0,
  ],
},

];