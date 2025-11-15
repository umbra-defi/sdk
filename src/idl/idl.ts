/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/umbra.json`.
 */
export type Umbra = {
  "address": "A5GtBtbNA3teSioCX2H3pqHncEqMPsnHxzzXYPFCzTA4",
  "metadata": {
    "name": "umbra",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Arcium & Anchor"
  },
  "instructions": [
    {
      "name": "collectCommissionFeesFromCommissionFeesPool",
      "discriminator": [
        201,
        184,
        100,
        86,
        244,
        139,
        30,
        78
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  32,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        }
      ]
    },
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolCallback",
      "discriminator": [
        54,
        133,
        94,
        178,
        137,
        91,
        204,
        119
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta"
        },
        {
          "name": "mixerPool"
        },
        {
          "name": "mixerPoolAta"
        },
        {
          "name": "commissionFeesPool"
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "collectCommissionFeesFromCommissionFeesPoolOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "collectCommissionFromPublicCommissionFeesPool",
      "discriminator": [
        2,
        10,
        197,
        249,
        211,
        68,
        148,
        190
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "publicCommissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  98,
                  108,
                  105,
                  99,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  30,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        }
      ]
    },
    {
      "name": "collectRelayerFeesFromRelayerFeesPool",
      "discriminator": [
        94,
        128,
        89,
        1,
        179,
        140,
        251,
        104
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "wsolMint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "relayer",
          "signer": true
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        }
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToShared",
      "discriminator": [
        69,
        245,
        71,
        77,
        148,
        207,
        77,
        26
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "arciumTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedCallback",
      "discriminator": [
        203,
        74,
        135,
        196,
        77,
        129,
        152,
        199
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "convertTokenAccountFromMxeToSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayer",
      "discriminator": [
        124,
        238,
        45,
        145,
        166,
        93,
        93,
        22
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  37,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  37,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "wsolMint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "wsolMint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerCallback",
      "discriminator": [
        237,
        34,
        107,
        107,
        23,
        64,
        223,
        168
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumSolTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesPool",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayer",
      "discriminator": [
        188,
        213,
        71,
        76,
        155,
        169,
        247,
        206
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "arciumSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  38,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  38,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "wsolMint"
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerCallback",
      "discriminator": [
        24,
        145,
        137,
        62,
        223,
        117,
        94,
        106
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumSolTokenAccount",
          "writable": true
        },
        {
          "name": "arciumSplTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesPool",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "convertUserAccountFromMxeToShared",
      "discriminator": [
        189,
        92,
        150,
        127,
        99,
        58,
        7,
        176
      ],
      "accounts": [
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "x25519PublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayer",
      "discriminator": [
        182,
        195,
        178,
        216,
        108,
        84,
        243,
        81
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  39,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  39,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "x25519PublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        }
      ]
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerCallback",
      "discriminator": [
        9,
        60,
        195,
        224,
        11,
        170,
        60,
        163
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumSolTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesPool",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "convertUserAccountFromMxeToSharedThroughRelayerOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "deleteComplianceGrant",
      "discriminator": [
        197,
        178,
        224,
        122,
        160,
        53,
        9,
        78
      ],
      "accounts": [
        {
          "name": "senderSigner",
          "signer": true
        },
        {
          "name": "signerArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "senderSigner"
              }
            ]
          }
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "complianceGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "deleteFeesConfiguration",
      "discriminator": [
        147,
        40,
        65,
        122,
        40,
        230,
        52,
        90
      ],
      "accounts": [
        {
          "name": "feesConfiguration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  2,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "deleteNetworkComplianceGrantMxe",
      "discriminator": [
        198,
        58,
        67,
        116,
        179,
        174,
        152,
        245
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  36,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "complianceGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  116,
                  119,
                  111,
                  114,
                  107,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                  95,
                  109,
                  120,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        }
      ]
    },
    {
      "name": "deleteNetworkComplianceGrantShared",
      "discriminator": [
        81,
        189,
        2,
        86,
        15,
        103,
        123,
        185
      ],
      "accounts": [
        {
          "name": "inquiredAddress"
        },
        {
          "name": "inquiredArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inquiredAddress"
              }
            ]
          }
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  34,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "complianceGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  116,
                  119,
                  111,
                  114,
                  107,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "inquired_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        }
      ]
    },
    {
      "name": "depositIntoMixerPoolSol",
      "discriminator": [
        121,
        149,
        238,
        205,
        181,
        205,
        161,
        39
      ],
      "accounts": [
        {
          "name": "arciumSigner",
          "docs": [
            "The Arcium signer who is making the deposit. Must be the owner of the Arcium user account."
          ],
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "docs": [
            "Arcium encrypted user account for the depositor. Must be initialized and active."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSignerWsolAta",
          "docs": [
            "Associated token account for the depositor's wrapped SOL holdings."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "relayer",
          "docs": [
            "The relayer who is facilitating this deposit. Receives relayer fees."
          ],
          "signer": true
        },
        {
          "name": "relayerAccount",
          "docs": [
            "Relayer account for the relayer. Must be initialized and active."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "docs": [
            "Relayer fees pool where relayer fees are accumulated. Must be initialized."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  19,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "publicCommissionFeesPool",
          "docs": [
            "Public commission fees pool where commission fees are accumulated. Must be initialized."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  98,
                  108,
                  105,
                  99,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  19,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "wsolMint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "docs": [
            "Fees configuration account containing relayer fees and commission fees settings."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  19,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "wsolMint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "docs": [
            "Program information account. Must be initialized and program must be active."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "docs": [
            "Mixer pool account for WSOL. Must be initialized and active."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolWsolAta",
          "docs": [
            "Associated token account for the mixer pool's wrapped SOL holdings."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "zkMerkleTree",
          "docs": [
            "ZK merkle tree for tracking deposits. Must be initialized and have space available."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation and management."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program interface for SPL token operations."
          ]
        },
        {
          "name": "wsolMint",
          "docs": [
            "Wrapped SOL mint account. Must match the official WSOL mint address."
          ]
        }
      ],
      "args": [
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "amount",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commitmentInnerHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "linkerHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "time",
          "type": {
            "defined": {
              "name": "time"
            }
          }
        },
        {
          "name": "proofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "proofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "proofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        }
      ]
    },
    {
      "name": "depositIntoMixerPoolSpl",
      "discriminator": [
        211,
        39,
        45,
        255,
        91,
        222,
        135,
        135
      ],
      "accounts": [
        {
          "name": "arciumSigner",
          "docs": [
            "The Arcium signer who is making the deposit. Must be the owner of the Arcium user account."
          ],
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "docs": [
            "Arcium encrypted user account for the depositor. Must be initialized and active."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSignerWsolAta",
          "docs": [
            "Associated token account for the depositor's wrapped SOL holdings (used for relayer fees)."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "arciumSignerSplAta",
          "docs": [
            "Associated token account for the depositor's SPL token holdings (the deposit token)."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "relayer",
          "docs": [
            "The relayer who is facilitating this deposit. Receives relayer fees in WSOL."
          ],
          "signer": true
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  20,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "publicCommissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  98,
                  108,
                  105,
                  99,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  20,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  20,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolWsolAta",
          "docs": [
            "Associated token account for the mixer pool's wrapped SOL holdings (for relayer fees)."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mixerPoolSplAta",
          "docs": [
            "Associated token account for the mixer pool's SPL token holdings."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "zkMerkleTree",
          "docs": [
            "ZK merkle tree for tracking deposits. Must be initialized and have space available."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "wsolMint",
          "docs": [
            "Wrapped SOL mint account. Must match the official WSOL mint address."
          ]
        },
        {
          "name": "mint",
          "docs": [
            "SPL token mint account. Must not be the WSOL mint address."
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "amount",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commitmentInnerHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "linkerHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "time",
          "type": {
            "defined": {
              "name": "time"
            }
          }
        },
        {
          "name": "proofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "proofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "proofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenDepositMxe",
      "discriminator": [
        60,
        94,
        20,
        30,
        143,
        169,
        254,
        127
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "accountAddress"
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              }
            ]
          }
        },
        {
          "name": "arciumTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "commissionFeePool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  8,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  8,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "nullifierHashAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "expectedNullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "ephemeralArcisPublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "depositAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart2Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "blindingFactorCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "commitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "expectedMerkleRoot",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedLinkerAddressHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenDepositMxeCallback",
      "discriminator": [
        91,
        40,
        41,
        137,
        138,
        234,
        111,
        104
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumTokenAccount",
          "writable": true
        },
        {
          "name": "arciumCommissionFeePool",
          "writable": true
        },
        {
          "name": "nullifierHashAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "existingTokenDepositMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenDepositShared",
      "discriminator": [
        181,
        173,
        183,
        192,
        100,
        148,
        0,
        32
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "accountAddress"
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              }
            ]
          }
        },
        {
          "name": "arciumTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "commissionFeePool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  10,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  10,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "nullifierHashAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "expectedNullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "ephemeralArcisPublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "depositAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart2Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "blindingFactorCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "commitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "expectedMerkleRoot",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedLinkerAddressHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenDepositSharedCallback",
      "discriminator": [
        9,
        13,
        115,
        85,
        118,
        176,
        157,
        176
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumTokenAccount",
          "writable": true
        },
        {
          "name": "arciumCommissionFeePool",
          "writable": true
        },
        {
          "name": "nullifierHashAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "existingTokenDepositSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSolMxe",
      "discriminator": [
        26,
        252,
        214,
        246,
        240,
        158,
        96,
        108
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  12,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPoolAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSolMxeCallback",
      "discriminator": [
        152,
        181,
        4,
        22,
        165,
        203,
        105,
        95
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "existingTokenTransferSolMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSolShared",
      "discriminator": [
        128,
        162,
        79,
        110,
        5,
        107,
        71,
        205
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  14,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  14,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  14,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPoolAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSolSharedCallback",
      "discriminator": [
        57,
        159,
        187,
        57,
        43,
        182,
        217,
        187
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "existingTokenTransferSolSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSplMxe",
      "discriminator": [
        22,
        76,
        0,
        77,
        108,
        205,
        48,
        189
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  16,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  16,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  16,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSplMxeCallback",
      "discriminator": [
        88,
        214,
        226,
        97,
        241,
        193,
        189,
        251
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "existingTokenTransferSplMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSplShared",
      "discriminator": [
        9,
        39,
        63,
        86,
        133,
        234,
        18,
        41
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  18,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  18,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  18,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "existingTokenTransferSplSharedCallback",
      "discriminator": [
        201,
        180,
        210,
        125,
        224,
        89,
        73,
        196
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "existingTokenTransferSplSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "freezeArciumTokenAccount",
      "discriminator": [
        149,
        157,
        114,
        187,
        195,
        185,
        49,
        138
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  26,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": []
    },
    {
      "name": "freezeArciumUserAccount",
      "discriminator": [
        219,
        85,
        248,
        151,
        219,
        98,
        61,
        239
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  25,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "freezeMixerPool",
      "discriminator": [
        15,
        113,
        98,
        45,
        142,
        96,
        168,
        135
      ],
      "accounts": [
        {
          "name": "mixerPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  3,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "freezeRelayerAccount",
      "discriminator": [
        138,
        127,
        213,
        126,
        252,
        121,
        242,
        168
      ],
      "accounts": [
        {
          "name": "relayer"
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  29,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": []
    },
    {
      "name": "initCollectCommissionFeesFromCommissionFeesPoolCompDef",
      "discriminator": [
        116,
        162,
        150,
        234,
        52,
        181,
        111,
        11
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initComplianceGrant",
      "discriminator": [
        143,
        119,
        31,
        42,
        224,
        250,
        186,
        168
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              }
            ]
          }
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "complianceGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arcium_sender_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedCompDef",
      "discriminator": [
        61,
        126,
        110,
        12,
        191,
        92,
        195,
        217
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedSolThroughRelayerCompDef",
      "discriminator": [
        78,
        44,
        113,
        161,
        182,
        1,
        168,
        243
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedSplThroughRelayerCompDef",
      "discriminator": [
        182,
        249,
        51,
        15,
        222,
        136,
        219,
        102
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initConvertUserAccountFromMxeToSharedThroughRelayerCompDef",
      "discriminator": [
        60,
        131,
        180,
        37,
        172,
        138,
        98,
        153
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initExistingTokenDepositMxeCompDef",
      "discriminator": [
        246,
        216,
        33,
        18,
        48,
        250,
        147,
        75
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initExistingTokenDepositSharedCompDef",
      "discriminator": [
        234,
        95,
        122,
        137,
        227,
        131,
        145,
        43
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initExistingTokenTransferSolMxeCompDef",
      "discriminator": [
        183,
        98,
        171,
        131,
        0,
        210,
        127,
        209
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initExistingTokenTransferSolSharedCompDef",
      "discriminator": [
        70,
        125,
        202,
        98,
        32,
        210,
        122,
        8
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initExistingTokenTransferSplMxeCompDef",
      "discriminator": [
        101,
        174,
        206,
        219,
        9,
        144,
        252,
        183
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initExistingTokenTransferSplSharedCompDef",
      "discriminator": [
        34,
        204,
        203,
        28,
        75,
        218,
        222,
        244
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initInitialiseCommissionFeesPoolCompDef",
      "discriminator": [
        77,
        33,
        161,
        76,
        38,
        73,
        178,
        70
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initNetworkComplianceGrantMxe",
      "discriminator": [
        172,
        255,
        140,
        55,
        170,
        254,
        198,
        50
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  35,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "complianceGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  116,
                  119,
                  111,
                  114,
                  107,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                  95,
                  109,
                  120,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        }
      ]
    },
    {
      "name": "initNetworkComplianceGrantShared",
      "discriminator": [
        168,
        177,
        125,
        22,
        95,
        16,
        69,
        37
      ],
      "accounts": [
        {
          "name": "inquiredAddress"
        },
        {
          "name": "inquiredArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inquiredAddress"
              }
            ]
          }
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  33,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "complianceGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  116,
                  119,
                  111,
                  114,
                  107,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "inquired_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        }
      ]
    },
    {
      "name": "initNewTokenDepositMxeCompDef",
      "discriminator": [
        233,
        145,
        23,
        76,
        47,
        43,
        73,
        165
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initNewTokenDepositSharedCompDef",
      "discriminator": [
        246,
        102,
        213,
        155,
        81,
        133,
        169,
        2
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initNewTokenTransferSolMxeCompDef",
      "discriminator": [
        242,
        205,
        66,
        55,
        96,
        122,
        54,
        46
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initNewTokenTransferSolSharedCompDef",
      "discriminator": [
        224,
        57,
        205,
        103,
        7,
        7,
        72,
        135
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initNewTokenTransferSplMxeCompDef",
      "discriminator": [
        115,
        8,
        131,
        114,
        97,
        34,
        221,
        139
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initNewTokenTransferSplSharedCompDef",
      "discriminator": [
        160,
        74,
        79,
        174,
        85,
        144,
        34,
        172
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initReencryptCiphertextsMxeCompDef",
      "discriminator": [
        138,
        97,
        222,
        233,
        246,
        253,
        75,
        108
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initReencryptCiphertextsSharedCompDef",
      "discriminator": [
        236,
        228,
        90,
        208,
        28,
        210,
        50,
        18
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initUpdateMasterViewingKeyCompDef",
      "discriminator": [
        165,
        3,
        37,
        180,
        6,
        52,
        151,
        118
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initWithdrawFromMixerMxeCompDef",
      "discriminator": [
        252,
        125,
        16,
        102,
        189,
        253,
        209,
        242
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initWithdrawFromMixerSharedCompDef",
      "discriminator": [
        10,
        146,
        6,
        152,
        110,
        117,
        94,
        81
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initWithdrawIntoMixerPoolSolCompDef",
      "discriminator": [
        168,
        60,
        176,
        186,
        216,
        84,
        165,
        174
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initWithdrawIntoMixerPoolSplCompDef",
      "discriminator": [
        8,
        89,
        179,
        13,
        148,
        92,
        121,
        108
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialiseArciumEncryptedTokenAccount",
      "discriminator": [
        45,
        195,
        73,
        170,
        132,
        86,
        53,
        186
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseArciumEncryptedUserAccount",
      "discriminator": [
        134,
        219,
        186,
        134,
        127,
        112,
        143,
        15
      ],
      "accounts": [
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationArciumUserAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseCommissionFeesPool",
      "discriminator": [
        19,
        246,
        46,
        12,
        136,
        86,
        120,
        25
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumCommissionFeesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  31,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseCommissionFeesPoolCallback",
      "discriminator": [
        28,
        154,
        118,
        113,
        129,
        137,
        176,
        22
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "commissionFeesPool",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "initialiseCommissionFeesPoolOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "initialiseFeesConfiguration",
      "discriminator": [
        171,
        90,
        55,
        37,
        27,
        1,
        177,
        62
      ],
      "accounts": [
        {
          "name": "feesConfiguration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "relayerFees",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commissionFeesLowerBound",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commissionFeesUpperBound",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commissionFees",
          "type": {
            "defined": {
              "name": "basisPoints"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseMasterWalletSpecifier",
      "discriminator": [
        171,
        194,
        239,
        102,
        2,
        169,
        234,
        46
      ],
      "accounts": [
        {
          "name": "masterWalletSpecifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "allowedAddress",
          "type": {
            "defined": {
              "name": "solanaPublicAddress"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseMixerPool",
      "discriminator": [
        173,
        86,
        150,
        10,
        119,
        20,
        219,
        219
      ],
      "accounts": [
        {
          "name": "mixerPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  4,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseNullifierHash",
      "discriminator": [
        248,
        24,
        128,
        65,
        206,
        94,
        60,
        132
      ],
      "accounts": [
        {
          "name": "nullifierHash",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseProgramInformation",
      "discriminator": [
        122,
        253,
        219,
        113,
        132,
        195,
        152,
        232
      ],
      "accounts": [
        {
          "name": "programInformation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  5,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "minimumNumberOfTransactionsBeforeWithdrawal",
          "type": {
            "defined": {
              "name": "numberOfTransactions"
            }
          }
        },
        {
          "name": "riskThreshold",
          "type": {
            "defined": {
              "name": "riskThreshold"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialisePublicCommissionFees",
      "discriminator": [
        233,
        61,
        69,
        52,
        253,
        188,
        83,
        228
      ],
      "accounts": [
        {
          "name": "publicCommissionFeesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  98,
                  108,
                  105,
                  99,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  28,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseRelayerAccount",
      "discriminator": [
        115,
        245,
        222,
        216,
        112,
        217,
        205,
        220
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "endpoint",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseRelayerFeesPool",
      "discriminator": [
        228,
        128,
        2,
        30,
        135,
        137,
        199,
        110
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayerFeesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseWalletSpecifier",
      "discriminator": [
        3,
        69,
        71,
        219,
        94,
        135,
        176,
        105
      ],
      "accounts": [
        {
          "name": "walletSpecifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              }
            ]
          }
        },
        {
          "name": "walletSpecifierForInitialisingWalletSpecifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "allowedAddress",
          "type": {
            "defined": {
              "name": "solanaPublicAddress"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "initialiseZkMerkleTree",
      "discriminator": [
        202,
        137,
        176,
        173,
        108,
        231,
        87,
        208
      ],
      "accounts": [
        {
          "name": "zkMerkleTree",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  27,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "modifyFeesConfiguration",
      "discriminator": [
        2,
        161,
        134,
        112,
        101,
        75,
        35,
        39
      ],
      "accounts": [
        {
          "name": "feesConfiguration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  1,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "accountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "relayerFees",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commissionFeesLowerBound",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commissionFeesUpperBound",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "commissionFees",
          "type": {
            "defined": {
              "name": "basisPoints"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "modifyProgramInformation",
      "discriminator": [
        194,
        202,
        139,
        86,
        107,
        84,
        15,
        168
      ],
      "accounts": [
        {
          "name": "programInformation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "walletSpecifier",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "enableProgram",
          "type": {
            "defined": {
              "name": "boolean"
            }
          }
        },
        {
          "name": "minimumSolBalanceRequired",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "minimumNumberOfTransactionsBeforeWithdrawal",
          "type": {
            "defined": {
              "name": "numberOfTransactions"
            }
          }
        },
        {
          "name": "riskThreshold",
          "type": {
            "defined": {
              "name": "riskThreshold"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "modifyWalletSpecifier",
      "discriminator": [
        203,
        245,
        173,
        109,
        159,
        174,
        238,
        51
      ],
      "accounts": [
        {
          "name": "walletSpecifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  115,
                  112,
                  101,
                  99,
                  105,
                  102,
                  105,
                  101,
                  114,
                  58
                ]
              },
              {
                "kind": "arg",
                "path": "instructionSeed"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "instructionSeed",
          "type": {
            "defined": {
              "name": "instructionSeed"
            }
          }
        },
        {
          "name": "allowedAddress",
          "type": {
            "defined": {
              "name": "solanaPublicAddress"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenDepositMxe",
      "discriminator": [
        249,
        154,
        163,
        44,
        29,
        201,
        134,
        86
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "accountAddress"
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              }
            ]
          }
        },
        {
          "name": "arciumTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "commissionFeePool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  7,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  7,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "nullifierHashAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "expectedNullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "ephemeralArcisPublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "depositAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart2Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "blindingFactorCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "commitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "expectedMerkleRoot",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedLinkerAddressHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenDepositMxeCallback",
      "discriminator": [
        130,
        173,
        225,
        36,
        144,
        162,
        150,
        208
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumTokenAccount",
          "writable": true
        },
        {
          "name": "arciumCommissionFeePool",
          "writable": true
        },
        {
          "name": "nullifierHashAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "newTokenDepositMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "newTokenDepositShared",
      "discriminator": [
        218,
        141,
        4,
        98,
        11,
        58,
        48,
        163
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "accountAddress"
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              }
            ]
          }
        },
        {
          "name": "arciumTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "accountAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "commissionFeePool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "nullifierHashAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "expectedNullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "ephemeralArcisPublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "depositAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "depositorAddressPart2Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "blindingFactorCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "commitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "expectedMerkleRoot",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedLinkerAddressHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenDepositSharedCallback",
      "discriminator": [
        130,
        136,
        165,
        212,
        190,
        172,
        34,
        140
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "arciumTokenAccount",
          "writable": true
        },
        {
          "name": "arciumCommissionFeePool",
          "writable": true
        },
        {
          "name": "nullifierHashAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "newTokenDepositSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSolMxe",
      "discriminator": [
        140,
        211,
        107,
        248,
        100,
        159,
        25,
        254
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPoolAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSolMxeCallback",
      "discriminator": [
        135,
        110,
        175,
        19,
        202,
        129,
        142,
        54
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "newTokenTransferSolMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSolShared",
      "discriminator": [
        253,
        60,
        194,
        115,
        153,
        235,
        171,
        132
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  13,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  13,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  13,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPoolAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSolSharedCallback",
      "discriminator": [
        54,
        111,
        127,
        134,
        190,
        212,
        89,
        250
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "newTokenTransferSolSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSplMxe",
      "discriminator": [
        15,
        166,
        200,
        21,
        131,
        246,
        132,
        163
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  15,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  15,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  15,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSplMxeCallback",
      "discriminator": [
        65,
        253,
        107,
        254,
        138,
        27,
        76,
        109
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "newTokenTransferSplMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSplShared",
      "discriminator": [
        118,
        91,
        145,
        85,
        29,
        161,
        152,
        226
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSenderSigner",
          "signer": true
        },
        {
          "name": "arciumSenderUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSenderSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "receiverAddress"
        },
        {
          "name": "arciumReceiverUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              }
            ]
          }
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "receiverAddress"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  17,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  17,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfigurationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  17,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformationAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "transferAmountCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "transferAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "newTokenTransferSplSharedCallback",
      "discriminator": [
        147,
        251,
        189,
        196,
        249,
        214,
        144,
        99
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSenderUserAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSolTokenAccount",
          "writable": true
        },
        {
          "name": "arciumSenderSplTokenAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverUserAccount",
          "writable": true
        },
        {
          "name": "arciumReceiverSplTokenAccount",
          "writable": true
        },
        {
          "name": "relayerFeesAccount",
          "writable": true
        },
        {
          "name": "commissionFeesAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "newTokenTransferSplSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "reencryptCiphertextsMxe",
      "discriminator": [
        243,
        21,
        53,
        155,
        241,
        139,
        170,
        71
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "networkAllotedComplianceGrant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  116,
                  119,
                  111,
                  114,
                  107,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                  95,
                  109,
                  120,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "ciphertext0",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext1",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext2",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext3",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext4",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        }
      ]
    },
    {
      "name": "reencryptCiphertextsMxeCallback",
      "discriminator": [
        17,
        234,
        187,
        68,
        39,
        30,
        218,
        250
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "reencryptCiphertextsMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "reencryptCiphertextsShared",
      "discriminator": [
        213,
        46,
        59,
        157,
        191,
        31,
        195,
        69
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "inquiredAddress"
        },
        {
          "name": "inquiredArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inquiredAddress"
              }
            ]
          }
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "userAllotedComplianceGrant",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inquired_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "networkAllotedComplianceGrant",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  116,
                  119,
                  111,
                  114,
                  107,
                  95,
                  97,
                  108,
                  108,
                  111,
                  116,
                  101,
                  100,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "inquired_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "account",
                "path": "destination_arcium_user_account.x25519_public_key.0",
                "account": "arciumEncryptedUserAccount"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "ciphertext0",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext1",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext2",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext3",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "ciphertext4",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        }
      ]
    },
    {
      "name": "reencryptCiphertextsSharedCallback",
      "discriminator": [
        63,
        225,
        209,
        194,
        15,
        4,
        51,
        253
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "reencryptCiphertextsSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "updateMasterViewingKey",
      "discriminator": [
        228,
        250,
        123,
        77,
        32,
        72,
        23,
        2
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "masterViewingKeyPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "masterViewingKeyBlindingFactor",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "masterViewingKeyCiphertextNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "masterViewingKeyShaCommitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "masterViewingKeyHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "proofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "proofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "proofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "updateMasterViewingKeyCallback",
      "discriminator": [
        127,
        243,
        198,
        178,
        166,
        241,
        55,
        20
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumUserAccount",
          "writable": true
        },
        {
          "name": "masterViewingKeyPoseidonCommitment"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "updateMasterViewingKeyOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "withdrawFromMixerMxe",
      "discriminator": [
        80,
        237,
        183,
        116,
        134,
        207,
        104,
        177
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "ephemeralSigner",
          "signer": true
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "publicCommissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  98,
                  108,
                  105,
                  99,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  23,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_public_commission_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "publicCommissionFeesPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "publicCommissionFeesPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  23,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "nullifierHashAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "publicCommissionFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "expectedNullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedMerkleRoot",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedLinkerAddressHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "ephemeralArcisPublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "noteCreatorAddressPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "noteCreatorAddressPart2Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "blindingFactorCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "noteCreatorAddressCommitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "amountToWithdraw",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawFromMixerMxeCallback",
      "discriminator": [
        244,
        149,
        68,
        16,
        57,
        92,
        255,
        13
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "writable": true
        },
        {
          "name": "mixerPool"
        },
        {
          "name": "mixerPoolAta",
          "writable": true
        },
        {
          "name": "publicCommissionFeesPool",
          "writable": true
        },
        {
          "name": "feesConfiguration"
        },
        {
          "name": "nullifierHashAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "withdrawFromMixerMxeOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "withdrawFromMixerShared",
      "discriminator": [
        104,
        248,
        221,
        51,
        199,
        48,
        213,
        98
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "ephemeralSigner",
          "signer": true
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "destinationAddress"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "destinationArciumUserAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "destinationAddress"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "publicCommissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  98,
                  108,
                  105,
                  99,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  24,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_public_commission_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "publicCommissionFeesPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "publicCommissionFeesPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  24,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mixerPoolAta",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mixerPool"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "nullifierHashAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "nullifierHash"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "publicCommissionFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "expectedNullifierHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedMerkleRoot",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "expectedLinkerAddressHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "ephemeralArcisPublicKey",
          "type": {
            "defined": {
              "name": "arciumX25519PublicKey"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "noteCreatorAddressPart1Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "noteCreatorAddressPart2Ciphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "blindingFactorCiphertext",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "noteCreatorAddressCommitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "amountToWithdraw",
          "type": {
            "defined": {
              "name": "amount"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawFromMixerSharedCallback",
      "discriminator": [
        178,
        54,
        164,
        232,
        17,
        193,
        228,
        138
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "destinationAddress"
        },
        {
          "name": "destinationAddressAta",
          "writable": true
        },
        {
          "name": "mixerPool"
        },
        {
          "name": "mixerPoolAta",
          "writable": true
        },
        {
          "name": "publicCommissionFeesPool",
          "writable": true
        },
        {
          "name": "feesConfiguration"
        },
        {
          "name": "nullifierHashAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "withdrawFromMixerSharedOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSol",
      "discriminator": [
        106,
        125,
        107,
        11,
        237,
        8,
        245,
        61
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumEncryptedAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  21,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  21,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_commission_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  21,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "withdrawalAmount",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "withdrawalAmountBlindingFactor",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "withdrawalAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "withdrawalAmountCommitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "time",
          "type": {
            "defined": {
              "name": "time"
            }
          }
        },
        {
          "name": "linkerHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "depositCommitment",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSolCallback",
      "discriminator": [
        242,
        127,
        9,
        227,
        159,
        220,
        63,
        106
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumEncryptedAccount",
          "writable": true
        },
        {
          "name": "arciumSolTokenAccount",
          "writable": true
        },
        {
          "name": "relayerPubkey"
        },
        {
          "name": "relayerFeesPool",
          "writable": true
        },
        {
          "name": "commissionFeesPool",
          "writable": true
        },
        {
          "name": "zkMerkleTree",
          "writable": true
        },
        {
          "name": "innerCommitmentHash"
        },
        {
          "name": "time"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "withdrawIntoMixerPoolSolOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSpl",
      "discriminator": [
        112,
        39,
        74,
        165,
        36,
        199,
        165,
        87
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "signPdaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "FsWbPQcJQ2cCyr9ndse13fDqds4F2Ezx2WgTL25Dke4M"
        },
        {
          "name": "clockAccount",
          "address": "AxygBawEvVwZPetj3yPJb9sGdZvaJYsVguET1zFUQkV"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "arciumSigner",
          "signer": true
        },
        {
          "name": "arciumEncryptedAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              }
            ]
          }
        },
        {
          "name": "arciumSolTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ]
          }
        },
        {
          "name": "arciumSplTokenAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  101,
                  110,
                  99,
                  114,
                  121,
                  112,
                  116,
                  101,
                  100,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "arciumSigner"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "relayerFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  22,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_relayer_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "commissionFeesPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  114,
                  99,
                  105,
                  117,
                  109,
                  95,
                  99,
                  111,
                  109,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  22,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_commission_fees_pool_offset.0"
              }
            ]
          }
        },
        {
          "name": "feesConfiguration",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              },
              {
                "kind": "const",
                "value": [
                  22,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "arg",
                "path": "_fees_configuration_account_offset.0"
              }
            ]
          }
        },
        {
          "name": "programInformation",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  105,
                  110,
                  102,
                  111,
                  114,
                  109,
                  97,
                  116,
                  105,
                  111,
                  110,
                  58
                ]
              }
            ]
          }
        },
        {
          "name": "mixerPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  120,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "zkMerkleTree",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  122,
                  107,
                  95,
                  109,
                  101,
                  114,
                  107,
                  108,
                  101,
                  95,
                  116,
                  114,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "wsolMint"
        },
        {
          "name": "mint"
        }
      ],
      "args": [
        {
          "name": "computationOffset",
          "type": {
            "defined": {
              "name": "computationOffset"
            }
          }
        },
        {
          "name": "relayerFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "commissionFeesPoolOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "feesConfigurationAccountOffset",
          "type": {
            "defined": {
              "name": "accountOffset"
            }
          }
        },
        {
          "name": "withdrawalAmount",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "withdrawalAmountBlindingFactor",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "withdrawalAmountNonce",
          "type": {
            "defined": {
              "name": "arciumX25519Nonce"
            }
          }
        },
        {
          "name": "withdrawalAmountCommitment",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        },
        {
          "name": "groth16ProofA",
          "type": {
            "defined": {
              "name": "groth16ProofA"
            }
          }
        },
        {
          "name": "groth16ProofB",
          "type": {
            "defined": {
              "name": "groth16ProofB"
            }
          }
        },
        {
          "name": "groth16ProofC",
          "type": {
            "defined": {
              "name": "groth16ProofC"
            }
          }
        },
        {
          "name": "time",
          "type": {
            "defined": {
              "name": "time"
            }
          }
        },
        {
          "name": "linkerHash",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "depositCommitment",
          "type": {
            "defined": {
              "name": "poseidonHash"
            }
          }
        },
        {
          "name": "optionalData",
          "type": {
            "defined": {
              "name": "sha3Hash"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSplCallback",
      "discriminator": [
        47,
        114,
        4,
        91,
        21,
        68,
        27,
        237
      ],
      "accounts": [
        {
          "name": "arciumProgram",
          "address": "Bv3Fb9VjzjWGfX18QTUcVycAfeLoQ5zZN6vv2g3cTZxp"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "arciumSigner"
        },
        {
          "name": "arciumEncryptedAccount",
          "writable": true
        },
        {
          "name": "arciumSolTokenAccount",
          "writable": true
        },
        {
          "name": "arciumSplTokenAccount",
          "writable": true
        },
        {
          "name": "relayerPubkey"
        },
        {
          "name": "relayerFeesPool",
          "writable": true
        },
        {
          "name": "commissionFeesPool",
          "writable": true
        },
        {
          "name": "zkMerkleTree",
          "writable": true
        },
        {
          "name": "innerCommitmentHash"
        },
        {
          "name": "time"
        }
      ],
      "args": [
        {
          "name": "outputs",
          "type": {
            "defined": {
              "name": "computationOutputs",
              "generics": [
                {
                  "kind": "type",
                  "type": {
                    "defined": {
                      "name": "withdrawIntoMixerPoolSplOutput"
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "arciumCommissionFeesPool",
      "discriminator": [
        165,
        97,
        220,
        176,
        166,
        151,
        70,
        165
      ]
    },
    {
      "name": "arciumComplianceGrant",
      "discriminator": [
        155,
        248,
        248,
        246,
        164,
        147,
        229,
        18
      ]
    },
    {
      "name": "arciumEncryptedTokenAccount",
      "discriminator": [
        216,
        237,
        32,
        168,
        65,
        157,
        126,
        43
      ]
    },
    {
      "name": "arciumEncryptedUserAccount",
      "discriminator": [
        50,
        169,
        192,
        123,
        237,
        48,
        13,
        6
      ]
    },
    {
      "name": "clockAccount",
      "discriminator": [
        152,
        171,
        158,
        195,
        75,
        61,
        51,
        8
      ]
    },
    {
      "name": "cluster",
      "discriminator": [
        236,
        225,
        118,
        228,
        173,
        106,
        18,
        60
      ]
    },
    {
      "name": "computationDefinitionAccount",
      "discriminator": [
        245,
        176,
        217,
        221,
        253,
        104,
        172,
        200
      ]
    },
    {
      "name": "feePool",
      "discriminator": [
        172,
        38,
        77,
        146,
        148,
        5,
        51,
        242
      ]
    },
    {
      "name": "feesConfiguration",
      "discriminator": [
        181,
        168,
        61,
        84,
        215,
        170,
        240,
        82
      ]
    },
    {
      "name": "mxeAccount",
      "discriminator": [
        103,
        26,
        85,
        250,
        179,
        159,
        17,
        117
      ]
    },
    {
      "name": "mixerPool",
      "discriminator": [
        125,
        154,
        206,
        245,
        90,
        148,
        241,
        66
      ]
    },
    {
      "name": "nullifierHash",
      "discriminator": [
        84,
        176,
        99,
        250,
        70,
        131,
        210,
        88
      ]
    },
    {
      "name": "programInformation",
      "discriminator": [
        12,
        16,
        241,
        227,
        252,
        111,
        207,
        92
      ]
    },
    {
      "name": "publicCommissionFeesPool",
      "discriminator": [
        222,
        29,
        220,
        14,
        164,
        181,
        241,
        189
      ]
    },
    {
      "name": "relayerAccount",
      "discriminator": [
        94,
        235,
        98,
        227,
        126,
        208,
        77,
        139
      ]
    },
    {
      "name": "relayerFeesPool",
      "discriminator": [
        68,
        139,
        102,
        249,
        36,
        108,
        90,
        228
      ]
    },
    {
      "name": "signerAccount",
      "discriminator": [
        127,
        212,
        7,
        180,
        17,
        50,
        249,
        193
      ]
    },
    {
      "name": "walletSpecifier",
      "discriminator": [
        202,
        56,
        44,
        7,
        7,
        228,
        139,
        203
      ]
    },
    {
      "name": "zkMerkleTree",
      "discriminator": [
        202,
        145,
        10,
        135,
        179,
        205,
        49,
        88
      ]
    }
  ],
  "events": [
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolFailedCallbackEvent",
      "discriminator": [
        116,
        142,
        35,
        60,
        161,
        40,
        117,
        47
      ]
    },
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolSuccessfulCallbackEvent",
      "discriminator": [
        142,
        95,
        164,
        49,
        114,
        194,
        235,
        103
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerSuccessfulCallbackEvent",
      "discriminator": [
        62,
        96,
        46,
        191,
        125,
        210,
        61,
        2
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerUnsuccessfulCallbackEvent",
      "discriminator": [
        63,
        41,
        248,
        198,
        94,
        4,
        210,
        51
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerSuccessfulCallbackEvent",
      "discriminator": [
        222,
        166,
        96,
        197,
        234,
        245,
        225,
        115
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerUnsuccessfulCallbackEvent",
      "discriminator": [
        8,
        52,
        148,
        200,
        79,
        190,
        111,
        98
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSuccessfulCallbackEvent",
      "discriminator": [
        1,
        132,
        44,
        109,
        13,
        29,
        116,
        32
      ]
    },
    {
      "name": "convertTokenAccountFromMxeToSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        51,
        68,
        59,
        133,
        21,
        32,
        98,
        152
      ]
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerSuccessfulCallbackEvent",
      "discriminator": [
        122,
        141,
        54,
        127,
        37,
        40,
        78,
        77
      ]
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerUnsuccessfulCallbackEvent",
      "discriminator": [
        34,
        74,
        79,
        157,
        233,
        248,
        39,
        36
      ]
    },
    {
      "name": "existingTokenDepositMxeSuccessfulCallbackEvent",
      "discriminator": [
        149,
        202,
        53,
        62,
        238,
        205,
        242,
        146
      ]
    },
    {
      "name": "existingTokenDepositMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        240,
        166,
        37,
        178,
        201,
        144,
        96,
        111
      ]
    },
    {
      "name": "existingTokenDepositSharedSuccessfulCallbackEvent",
      "discriminator": [
        109,
        142,
        115,
        218,
        52,
        30,
        245,
        36
      ]
    },
    {
      "name": "existingTokenDepositSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        43,
        46,
        139,
        127,
        192,
        44,
        11,
        101
      ]
    },
    {
      "name": "existingTokenTransferSolMxeSuccessfulCallbackEvent",
      "discriminator": [
        213,
        179,
        213,
        248,
        118,
        16,
        40,
        115
      ]
    },
    {
      "name": "existingTokenTransferSolMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        160,
        136,
        41,
        87,
        90,
        218,
        78,
        156
      ]
    },
    {
      "name": "existingTokenTransferSolSharedSuccessfulCallbackEvent",
      "discriminator": [
        203,
        98,
        14,
        113,
        187,
        194,
        126,
        176
      ]
    },
    {
      "name": "existingTokenTransferSolSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        0,
        151,
        168,
        50,
        18,
        242,
        200,
        205
      ]
    },
    {
      "name": "existingTokenTransferSplMxeSuccessfulCallbackEvent",
      "discriminator": [
        116,
        39,
        253,
        52,
        122,
        204,
        218,
        153
      ]
    },
    {
      "name": "existingTokenTransferSplMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        72,
        94,
        47,
        242,
        146,
        249,
        61,
        159
      ]
    },
    {
      "name": "existingTokenTransferSplSharedSuccessfulCallbackEvent",
      "discriminator": [
        242,
        197,
        105,
        190,
        106,
        13,
        103,
        159
      ]
    },
    {
      "name": "existingTokenTransferSplSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        59,
        62,
        117,
        19,
        72,
        142,
        132,
        228
      ]
    },
    {
      "name": "freezeMixerPoolEvent",
      "discriminator": [
        81,
        244,
        66,
        225,
        193,
        45,
        164,
        93
      ]
    },
    {
      "name": "initCollectCommissionFeesFromCommissionFeesPoolCompDefEvent",
      "discriminator": [
        245,
        207,
        145,
        5,
        136,
        129,
        149,
        192
      ]
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedCompDefEvent",
      "discriminator": [
        13,
        36,
        249,
        64,
        23,
        28,
        143,
        166
      ]
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedSolThroughRelayerCompDefEvent",
      "discriminator": [
        131,
        166,
        227,
        208,
        139,
        135,
        85,
        81
      ]
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedSplThroughRelayerCompDefEvent",
      "discriminator": [
        138,
        203,
        190,
        102,
        45,
        177,
        194,
        8
      ]
    },
    {
      "name": "initConvertUserAccountFromMxeToSharedThroughRelayerCompDefEvent",
      "discriminator": [
        85,
        151,
        30,
        222,
        107,
        159,
        187,
        91
      ]
    },
    {
      "name": "initExistingTokenDepositMxeCompDefEvent",
      "discriminator": [
        23,
        39,
        44,
        202,
        85,
        222,
        239,
        11
      ]
    },
    {
      "name": "initExistingTokenDepositSharedCompDefEvent",
      "discriminator": [
        44,
        27,
        127,
        8,
        94,
        170,
        134,
        28
      ]
    },
    {
      "name": "initExistingTokenTransferSolMxeCompDefEvent",
      "discriminator": [
        125,
        59,
        13,
        236,
        101,
        25,
        51,
        89
      ]
    },
    {
      "name": "initExistingTokenTransferSolSharedCompDefEvent",
      "discriminator": [
        113,
        170,
        144,
        176,
        222,
        177,
        64,
        140
      ]
    },
    {
      "name": "initExistingTokenTransferSplMxeCompDefEvent",
      "discriminator": [
        158,
        191,
        151,
        54,
        22,
        199,
        123,
        169
      ]
    },
    {
      "name": "initExistingTokenTransferSplSharedCompDefEvent",
      "discriminator": [
        174,
        156,
        206,
        13,
        240,
        104,
        141,
        124
      ]
    },
    {
      "name": "initInitialiseCommissionFeesPoolCompDefEvent",
      "discriminator": [
        90,
        11,
        158,
        203,
        186,
        60,
        232,
        175
      ]
    },
    {
      "name": "initNewTokenDepositMxeCompDefEvent",
      "discriminator": [
        225,
        79,
        211,
        97,
        5,
        113,
        21,
        196
      ]
    },
    {
      "name": "initNewTokenDepositSharedCompDefEvent",
      "discriminator": [
        249,
        205,
        75,
        198,
        111,
        243,
        146,
        63
      ]
    },
    {
      "name": "initNewTokenTransferSolMxeCompDefEvent",
      "discriminator": [
        136,
        22,
        167,
        78,
        155,
        152,
        139,
        73
      ]
    },
    {
      "name": "initNewTokenTransferSolSharedCompDefEvent",
      "discriminator": [
        162,
        235,
        187,
        18,
        71,
        133,
        224,
        123
      ]
    },
    {
      "name": "initNewTokenTransferSplMxeCompDefEvent",
      "discriminator": [
        106,
        177,
        206,
        213,
        209,
        171,
        150,
        120
      ]
    },
    {
      "name": "initNewTokenTransferSplSharedCompDefEvent",
      "discriminator": [
        162,
        200,
        160,
        147,
        144,
        22,
        252,
        230
      ]
    },
    {
      "name": "initReencryptCiphertextsMxeCompDefEvent",
      "discriminator": [
        111,
        201,
        84,
        206,
        230,
        196,
        254,
        50
      ]
    },
    {
      "name": "initReencryptCiphertextsSharedCompDefEvent",
      "discriminator": [
        167,
        39,
        117,
        169,
        244,
        212,
        26,
        203
      ]
    },
    {
      "name": "initUpdateMasterViewingKeyCompDefEvent",
      "discriminator": [
        208,
        28,
        226,
        133,
        46,
        227,
        193,
        36
      ]
    },
    {
      "name": "initWithdrawFromMixerMxeCompDefEvent",
      "discriminator": [
        70,
        109,
        204,
        246,
        107,
        46,
        170,
        220
      ]
    },
    {
      "name": "initWithdrawFromMixerSharedCompDefEvent",
      "discriminator": [
        251,
        169,
        170,
        218,
        83,
        226,
        28,
        131
      ]
    },
    {
      "name": "initWithdrawIntoMixerPoolSolCompDefEvent",
      "discriminator": [
        12,
        20,
        123,
        194,
        216,
        217,
        176,
        239
      ]
    },
    {
      "name": "initWithdrawIntoMixerPoolSplCompDefEvent",
      "discriminator": [
        94,
        32,
        238,
        247,
        113,
        219,
        117,
        172
      ]
    },
    {
      "name": "initialiseCommissionFeesPoolFailedCallbackEvent",
      "discriminator": [
        186,
        45,
        137,
        34,
        191,
        249,
        80,
        12
      ]
    },
    {
      "name": "initialiseCommissionFeesPoolSuccessfulCallbackEvent",
      "discriminator": [
        66,
        104,
        177,
        28,
        251,
        77,
        136,
        232
      ]
    },
    {
      "name": "initialiseMixerPoolEvent",
      "discriminator": [
        25,
        254,
        99,
        20,
        99,
        206,
        138,
        238
      ]
    },
    {
      "name": "newTokenDepositMxeSuccessfulCallbackEvent",
      "discriminator": [
        185,
        204,
        202,
        24,
        10,
        96,
        219,
        14
      ]
    },
    {
      "name": "newTokenDepositMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        53,
        228,
        57,
        28,
        166,
        155,
        60,
        24
      ]
    },
    {
      "name": "newTokenDepositSharedSuccessfulCallbackEvent",
      "discriminator": [
        115,
        145,
        144,
        255,
        223,
        93,
        194,
        29
      ]
    },
    {
      "name": "newTokenDepositSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        146,
        180,
        26,
        27,
        30,
        82,
        219,
        72
      ]
    },
    {
      "name": "newTokenTransferSolMxeSuccessfulCallbackEvent",
      "discriminator": [
        245,
        183,
        227,
        33,
        40,
        56,
        227,
        172
      ]
    },
    {
      "name": "newTokenTransferSolMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        252,
        39,
        19,
        35,
        32,
        48,
        95,
        211
      ]
    },
    {
      "name": "newTokenTransferSolSharedSuccessfulCallbackEvent",
      "discriminator": [
        131,
        119,
        86,
        202,
        168,
        109,
        181,
        82
      ]
    },
    {
      "name": "newTokenTransferSolSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        166,
        126,
        197,
        81,
        221,
        34,
        1,
        117
      ]
    },
    {
      "name": "newTokenTransferSplMxeSuccessfulCallbackEvent",
      "discriminator": [
        161,
        181,
        163,
        37,
        95,
        70,
        159,
        26
      ]
    },
    {
      "name": "newTokenTransferSplMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        96,
        32,
        184,
        46,
        209,
        4,
        173,
        215
      ]
    },
    {
      "name": "newTokenTransferSplSharedSuccessfulCallbackEvent",
      "discriminator": [
        20,
        90,
        4,
        162,
        41,
        110,
        21,
        61
      ]
    },
    {
      "name": "newTokenTransferSplSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        25,
        116,
        104,
        35,
        175,
        95,
        101,
        4
      ]
    },
    {
      "name": "reencryptCiphertextsMxeSuccessfulCallbackEvent",
      "discriminator": [
        172,
        132,
        162,
        41,
        134,
        92,
        130,
        56
      ]
    },
    {
      "name": "reencryptCiphertextsMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        210,
        232,
        60,
        220,
        228,
        212,
        170,
        201
      ]
    },
    {
      "name": "reencryptCiphertextsSharedSuccessfulCallbackEvent",
      "discriminator": [
        62,
        191,
        250,
        126,
        255,
        87,
        243,
        203
      ]
    },
    {
      "name": "reencryptCiphertextsSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        121,
        224,
        107,
        236,
        124,
        130,
        108,
        129
      ]
    },
    {
      "name": "updateMasterViewingKeyUnsuccessfulCallbackEvent",
      "discriminator": [
        116,
        221,
        219,
        111,
        214,
        157,
        190,
        175
      ]
    },
    {
      "name": "withdrawFromMixerMxeSuccessfulCallbackEvent",
      "discriminator": [
        250,
        64,
        163,
        17,
        206,
        163,
        210,
        226
      ]
    },
    {
      "name": "withdrawFromMixerMxeUnsuccessfulCallbackEvent",
      "discriminator": [
        69,
        197,
        190,
        123,
        211,
        210,
        100,
        156
      ]
    },
    {
      "name": "withdrawFromMixerSharedSuccessfulCallbackEvent",
      "discriminator": [
        35,
        175,
        252,
        39,
        254,
        218,
        34,
        179
      ]
    },
    {
      "name": "withdrawFromMixerSharedUnsuccessfulCallbackEvent",
      "discriminator": [
        191,
        56,
        97,
        241,
        104,
        111,
        208,
        139
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSolSuccessfulCallbackEvent",
      "discriminator": [
        22,
        109,
        121,
        155,
        176,
        156,
        243,
        192
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSolUnsuccessfulCallbackEvent",
      "discriminator": [
        46,
        191,
        208,
        209,
        213,
        47,
        196,
        141
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSplSuccessfulCallbackEvent",
      "discriminator": [
        29,
        170,
        142,
        92,
        77,
        190,
        115,
        19
      ]
    },
    {
      "name": "withdrawIntoMixerPoolSplUnsuccessfulCallbackEvent",
      "discriminator": [
        24,
        146,
        229,
        114,
        173,
        203,
        209,
        253
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mxeAccountNotSet",
      "msg": "Mxe account not set"
    },
    {
      "code": 6001,
      "name": "destinationArciumUserAccountNotInitialised",
      "msg": "Destination arcium user account not initialised"
    },
    {
      "code": 6002,
      "name": "destinationArciumUserAccountNotActive",
      "msg": "Destination arcium user account not active"
    },
    {
      "code": 6003,
      "name": "destinationArciumUserAccountNotSharedEncrypted",
      "msg": "Destination arcium user account not shared encrypted"
    }
  ],
  "types": [
    {
      "name": "versionByte",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "canonicalBump",
      "type": {
        "kind": "struct",
        "fields": [
          "u8"
        ]
      }
    },
    {
      "name": "reservedSpace",
      "type": {
        "kind": "struct",
        "fields": [
          "u8"
        ]
      }
    },
    {
      "name": "arciumX25519PublicKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "rescueCiphertext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "arciumX25519Nonce",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "computationOffset",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "groth16ProofA",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              64
            ]
          }
        ]
      }
    },
    {
      "name": "groth16ProofB",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              128
            ]
          }
        ]
      }
    },
    {
      "name": "groth16ProofC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              64
            ]
          }
        ]
      }
    },
    {
      "name": "sha3Hash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "poseidonHash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "zkMerkleTreeInsertionIndex",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "flagBits",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "amount",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "basisPoints",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "accountOffset",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "ephemeralOffset",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "year",
      "type": {
        "kind": "struct",
        "fields": [
          "i32"
        ]
      }
    },
    {
      "name": "month",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "day",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "hour",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "minute",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "seconds",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "blockchainId",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "time",
      "type": {
        "kind": "struct",
        "fields": [
          "i64"
        ]
      }
    },
    {
      "name": "boolean",
      "type": {
        "kind": "struct",
        "fields": [
          "bool"
        ]
      }
    },
    {
      "name": "slot",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "riskThreshold",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              16
            ]
          }
        ]
      }
    },
    {
      "name": "seed",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "solanaPublicAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "mintPublicAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "programDerivedAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "instructionSeed",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "numberOfTransactions",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "activation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "deactivationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          }
        ]
      }
    },
    {
      "name": "arciumCommissionFeesPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "flagBits"
              }
            }
          },
          {
            "name": "nonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "balance",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "numberOfTransactionsSinceLastWithdrawal",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "arciumComplianceGrant",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          }
        ]
      }
    },
    {
      "name": "arciumEncryptedTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "flagBits"
              }
            }
          },
          {
            "name": "nonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "balance",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "arciumEncryptedUserAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "flagBits"
              }
            }
          },
          {
            "name": "x25519PublicKey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "masterViewingKeyHash",
            "type": {
              "defined": {
                "name": "poseidonHash"
              }
            }
          },
          {
            "name": "masterViewingKeyCiphertextPart1",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "masterViewingKeyCiphertextNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "circuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "local",
            "fields": [
              {
                "defined": {
                  "name": "localCircuitSource"
                }
              }
            ]
          },
          {
            "name": "onChain",
            "fields": [
              {
                "defined": {
                  "name": "onChainCircuitSource"
                }
              }
            ]
          },
          {
            "name": "offChain",
            "fields": [
              {
                "defined": {
                  "name": "offChainCircuitSource"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "clockAccount",
      "docs": [
        "An account storing the current network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "currentEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "startEpochTimestamp",
            "type": {
              "defined": {
                "name": "timestamp"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cluster",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "maxSize",
            "type": "u32"
          },
          {
            "name": "activation",
            "type": {
              "defined": {
                "name": "activation"
              }
            }
          },
          {
            "name": "maxCapacity",
            "type": "u64"
          },
          {
            "name": "cuPrice",
            "type": "u64"
          },
          {
            "name": "cuPriceProposals",
            "type": {
              "array": [
                "u64",
                32
              ]
            }
          },
          {
            "name": "lastUpdatedEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "mxes",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "nodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "pendingNodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolFailedCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "collectCommissionFeesFromCommissionFeesPoolOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": "bool"
          },
          {
            "name": "field2",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "collectCommissionFeesFromCommissionFeesPoolSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commissionFeeWithdrawn",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "computationDefinitionAccount",
      "docs": [
        "An account representing a [ComputationDefinition] in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "finalizationAuthority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "cuAmount",
            "type": "u64"
          },
          {
            "name": "definition",
            "type": {
              "defined": {
                "name": "computationDefinitionMeta"
              }
            }
          },
          {
            "name": "circuitSource",
            "type": {
              "defined": {
                "name": "circuitSource"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "computationDefinitionMeta",
      "docs": [
        "A computation definition for execution in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "circuitLen",
            "type": "u32"
          },
          {
            "name": "signature",
            "type": {
              "defined": {
                "name": "computationSignature"
              }
            }
          }
        ]
      }
    },
    {
      "name": "computationOutputs",
      "generics": [
        {
          "kind": "type",
          "name": "o"
        }
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "success",
            "fields": [
              {
                "generic": "o"
              }
            ]
          },
          {
            "name": "failure"
          }
        ]
      }
    },
    {
      "name": "computationSignature",
      "docs": [
        "The signature of a computation defined in a [ComputationDefinition]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "parameters",
            "type": {
              "vec": {
                "defined": {
                  "name": "parameter"
                }
              }
            }
          },
          {
            "name": "outputs",
            "type": {
              "vec": {
                "defined": {
                  "name": "output"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": "bool"
          },
          {
            "name": "field2",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newSolBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "doesUserHaveEnoughSolBalanceAfterConversion",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSolThroughRelayerUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": "bool"
          },
          {
            "name": "field3",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newSplBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "doesUserHaveEnoughSolBalanceAfterConversion",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSplThroughRelayerUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "convertTokenAccountFromMxeToSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "convertUserAccountFromMxeToSharedThroughRelayerOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": "bool"
          },
          {
            "name": "field2",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newSolBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "doesUserHaveEnoughSolBalanceAfterConversion",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "convertUserAccountFromMxeToSharedThroughRelayerUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "epoch",
      "docs": [
        "The network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "existingTokenDepositMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "existingTokenDepositMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenDepositMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenDepositMxeSuccessfulCallbackEvent",
      "docs": [
        "Event emitted when an existing token deposit computation completes successfully.",
        "",
        "This event contains all the updated encrypted state after a successful deposit to",
        "an existing token account structure."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitmentVerified",
            "docs": [
              "Whether the commitment was successfully verified."
            ],
            "type": "bool"
          },
          {
            "name": "newUserAccountBalance",
            "docs": [
              "The new encrypted balance for the user account (existing balance + deposit amount)."
            ],
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newCommissionFeePool",
            "docs": [
              "The updated commission fee pool with new balance and transaction count."
            ],
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "depositorSolanaAddressReencryptedForMxe",
            "docs": [
              "The depositor's Solana address re-encrypted in MXE format."
            ],
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenDepositMxeUnsuccessfulCallbackEvent",
      "docs": [
        "Event emitted when an existing token deposit computation fails.",
        "",
        "This event is emitted when the commitment verification fails or the computation",
        "itself fails."
      ],
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "existingTokenDepositSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "existingTokenDepositSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenDepositSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenDepositSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitmentVerified",
            "type": "bool"
          },
          {
            "name": "newUserAccountBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newCommissionFeePool",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "amountReencryptedForDepositor",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "amountReencryptedForReceiver",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "depositorSolanaAddressReencrypted",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenDepositSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "existingTokenTransferSolMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "existingTokenTransferSolMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSolMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": "bool"
          },
          {
            "name": "field5",
            "type": "bool"
          },
          {
            "name": "field6",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSolMxeSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderNewBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "doesReceiverHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSolMxeUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "existingTokenTransferSolSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "existingTokenTransferSolSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSolSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": "bool"
          },
          {
            "name": "field6",
            "type": "bool"
          },
          {
            "name": "field7",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSolSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderNewBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverNewBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "receiverNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "doesReceiverHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSolSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "existingTokenTransferSplMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "existingTokenTransferSplMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSplMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": "bool"
          },
          {
            "name": "field6",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSplMxeSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderNewSolTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewSolTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewSolTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "senderNewSplTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverNewSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverNewSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughSolBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSplMxeUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "existingTokenTransferSplSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "existingTokenTransferSplSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSplSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field6",
            "type": "bool"
          },
          {
            "name": "field7",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSplSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderSolTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderSolTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderSolTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "senderSplTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughSolBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "existingTokenTransferSplSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "feePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "feesConfiguration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "relayerFees",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "commissionFeesLowerBound",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "commissionFeesUpperBound",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "commissionFees",
            "type": {
              "defined": {
                "name": "basisPoints"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "freezeMixerPoolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mixerPool",
            "type": {
              "defined": {
                "name": "programDerivedAddress"
              }
            }
          },
          {
            "name": "signer",
            "type": {
              "defined": {
                "name": "solanaPublicAddress"
              }
            }
          },
          {
            "name": "mint",
            "type": {
              "defined": {
                "name": "mintPublicAddress"
              }
            }
          }
        ]
      }
    },
    {
      "name": "initCollectCommissionFeesFromCommissionFeesPoolCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedSolThroughRelayerCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initConvertTokenAccountFromMxeToSharedSplThroughRelayerCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initConvertUserAccountFromMxeToSharedThroughRelayerCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initExistingTokenDepositMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initExistingTokenDepositSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initExistingTokenTransferSolMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initExistingTokenTransferSolSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initExistingTokenTransferSplMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initExistingTokenTransferSplSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initInitialiseCommissionFeesPoolCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initNewTokenDepositMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initNewTokenDepositSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initNewTokenTransferSolMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initNewTokenTransferSolSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initNewTokenTransferSplMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initNewTokenTransferSplSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initReencryptCiphertextsMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initReencryptCiphertextsSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initUpdateMasterViewingKeyCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initWithdrawFromMixerMxeCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initWithdrawFromMixerSharedCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initWithdrawIntoMixerPoolSolCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initWithdrawIntoMixerPoolSplCompDefEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initialiseCommissionFeesPoolFailedCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "initialiseCommissionFeesPoolOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "initialiseCommissionFeesPoolOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "initialiseCommissionFeesPoolOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "initialiseCommissionFeesPoolSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newCommissionFeePool",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "initialiseMixerPoolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mixerPool",
            "type": {
              "defined": {
                "name": "programDerivedAddress"
              }
            }
          },
          {
            "name": "signer",
            "type": {
              "defined": {
                "name": "solanaPublicAddress"
              }
            }
          },
          {
            "name": "mint",
            "type": {
              "defined": {
                "name": "mintPublicAddress"
              }
            }
          }
        ]
      }
    },
    {
      "name": "localCircuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "mxeKeygen"
          }
        ]
      }
    },
    {
      "name": "mxeAccount",
      "docs": [
        "A MPC Execution Environment."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "cluster",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "utilityPubkeys",
            "type": {
              "defined": {
                "name": "setUnset",
                "generics": [
                  {
                    "kind": "type",
                    "type": {
                      "defined": {
                        "name": "utilityPubkeys"
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "fallbackClusters",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "rejectedClusters",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "computationDefinitions",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "mxeEncryptedStruct",
      "generics": [
        {
          "kind": "const",
          "name": "len",
          "type": "usize"
        }
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u128"
          },
          {
            "name": "ciphertexts",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                {
                  "generic": "len"
                }
              ]
            }
          }
        ]
      }
    },
    {
      "name": "mixerPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "flagBits"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "newTokenDepositMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositMxeSuccessfulCallbackEvent",
      "docs": [
        "Event emitted when a new token deposit computation completes successfully.",
        "",
        "This event contains all the updated encrypted state after a successful deposit."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitmentVerified",
            "docs": [
              "Whether the commitment was successfully verified."
            ],
            "type": "bool"
          },
          {
            "name": "newUserAccountBalance",
            "docs": [
              "The new encrypted balance for the user account."
            ],
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newCommissionFeePool",
            "docs": [
              "The updated commission fee pool with new balance and transaction count."
            ],
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "depositorSolanaAddressReencryptedForMxe",
            "docs": [
              "The depositor's Solana address re-encrypted in MXE format."
            ],
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositMxeUnsuccessfulCallbackEvent",
      "docs": [
        "Event emitted when a new token deposit computation fails.",
        "",
        "This event is emitted when the commitment verification fails or the computation",
        "itself fails."
      ],
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "newTokenDepositSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "newTokenDepositSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field6",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitmentVerified",
            "type": "bool"
          },
          {
            "name": "newUserAccountBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newCommissionFeePool",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "amountReencryptedForDepositor",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "amountReencryptedForReceiver",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "depositorSolanaAddressReencrypted",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenDepositSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "newTokenTransferSolMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "newTokenTransferSolMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSolMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": "bool"
          },
          {
            "name": "field5",
            "type": "bool"
          },
          {
            "name": "field6",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSolMxeSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderNewBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "doesReceiverHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSolMxeUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "newTokenTransferSolSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "newTokenTransferSolSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSolSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": "bool"
          },
          {
            "name": "field6",
            "type": "bool"
          },
          {
            "name": "field7",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSolSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderNewBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverNewBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "receiverNewBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverNewBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "doesReceiverHaveEnoughBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSolSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "newTokenTransferSplMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "newTokenTransferSplMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSplMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": "bool"
          },
          {
            "name": "field6",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSplMxeSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderNewSolTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewSolTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewSolTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "senderNewSplTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderNewSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderNewSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverNewSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverNewSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughSolBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSplMxeUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "newTokenTransferSplSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "newTokenTransferSplSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSplSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "field6",
            "type": "bool"
          },
          {
            "name": "field7",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSplSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderSolTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderSolTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderSolTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "senderSplTokenAccountBalancePubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "senderSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "senderSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "receiverSplTokenAccountBalanceNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "receiverSplTokenAccountBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "commissionFeePoolBalanceCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "commissionFeePoolNumberOfTransactionsCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForSenderSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverPubkey",
            "type": {
              "defined": {
                "name": "arciumX25519PublicKey"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverNonce",
            "type": {
              "defined": {
                "name": "arciumX25519Nonce"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverTransferAmountCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverCommissionFeeCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "transferAmountReencryptedForReceiverSuccessCiphertext",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "doesSenderHaveEnoughSolBalanceAfterTransfer",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "newTokenTransferSplSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "nodeRef",
      "docs": [
        "A reference to a node in the cluster.",
        "The offset is to derive the Node Account.",
        "The current_total_rewards is the total rewards the node has received so far in the current",
        "epoch."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offset",
            "type": "u32"
          },
          {
            "name": "currentTotalRewards",
            "type": "u64"
          },
          {
            "name": "vote",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "nullifierHash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "consumed",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          }
        ]
      }
    },
    {
      "name": "offChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "source",
            "type": "string"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "onChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "name": "uploadAuth",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "output",
      "docs": [
        "An output of a computation.",
        "We currently don't support encrypted outputs yet since encrypted values are passed via",
        "data objects."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisPubkey"
          },
          {
            "name": "plaintextFloat"
          },
          {
            "name": "plaintextPoint"
          }
        ]
      }
    },
    {
      "name": "parameter",
      "docs": [
        "A parameter of a computation.",
        "We differentiate between plaintext and encrypted parameters and data objects.",
        "Plaintext parameters are directly provided as their value.",
        "Encrypted parameters are provided as an offchain reference to the data.",
        "Data objects are provided as a reference to the data object account."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisPubkey"
          },
          {
            "name": "arcisSignature"
          },
          {
            "name": "plaintextFloat"
          },
          {
            "name": "manticoreAlgo"
          },
          {
            "name": "inputDataset"
          }
        ]
      }
    },
    {
      "name": "programInformation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "programStatus",
            "type": {
              "defined": {
                "name": "flagBits"
              }
            }
          },
          {
            "name": "minimumSolBalanceRequired",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "minimumNumberOfTransactionsBeforeWithdrawal",
            "type": {
              "defined": {
                "name": "numberOfTransactions"
              }
            }
          },
          {
            "name": "riskThreshold",
            "type": {
              "defined": {
                "name": "riskThreshold"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "publicCommissionFeesPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "balance",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "reencryptCiphertextsMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "5"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "reencryptCiphertextsMxeSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reencryptedData",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "5"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "reencryptCiphertextsMxeUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "reencryptCiphertextsSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "5"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "reencryptCiphertextsSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reencryptedData",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "5"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "reencryptCiphertextsSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "relayerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "flagBits"
              }
            }
          },
          {
            "name": "endpoint",
            "type": {
              "defined": {
                "name": "sha3Hash"
              }
            }
          },
          {
            "name": "relayerFeesAccountCurrentCreationOffset",
            "type": {
              "defined": {
                "name": "accountOffset"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "relayerFeesPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "balance",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "setUnset",
      "generics": [
        {
          "kind": "type",
          "name": "t"
        }
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "set",
            "fields": [
              {
                "generic": "t"
              }
            ]
          },
          {
            "name": "unset",
            "fields": [
              {
                "generic": "t"
              },
              {
                "vec": "bool"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "sharedEncryptedStruct",
      "generics": [
        {
          "kind": "const",
          "name": "len",
          "type": "usize"
        }
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptionKey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u128"
          },
          {
            "name": "ciphertexts",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                {
                  "generic": "len"
                }
              ]
            }
          }
        ]
      }
    },
    {
      "name": "signerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "timestamp",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "updateMasterViewingKeyOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "updateMasterViewingKeyOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "updateMasterViewingKeyOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "updateMasterViewingKeyUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "utilityPubkeys",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x25519Pubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "ed25519VerifyingKey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "elgamalPubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "pubkeyValidityProof",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "walletSpecifier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "allowedAddress",
            "type": {
              "defined": {
                "name": "solanaPublicAddress"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerMxeOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "withdrawFromMixerMxeOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerMxeOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": "bool"
          },
          {
            "name": "field2",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerMxeSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addressReencryptedForMxe",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "commitmentVerified",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerMxeUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "withdrawFromMixerSharedOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "withdrawFromMixerSharedOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerSharedOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field1",
            "type": "bool"
          },
          {
            "name": "field2",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerSharedSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addressReencryptedForShared",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "commitmentVerified",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          }
        ]
      }
    },
    {
      "name": "withdrawFromMixerSharedUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "withdrawIntoMixerPoolSolOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "withdrawIntoMixerPoolSolOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "withdrawIntoMixerPoolSolOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": "u128"
          },
          {
            "name": "field5",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "withdrawIntoMixerPoolSolSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newUserSolBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newCommissionFeePoolBalance",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "withdrawalAmountBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "commitmentVerified",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "amount"
              }
            }
          },
          {
            "name": "doesUserHaveEnoughSolBalanceAfterWithdrawal",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "withdrawIntoMixerPoolSolUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "withdrawIntoMixerPoolSplOutput",
      "docs": [
        "The output of the callback instruction. Provided as a struct with ordered fields",
        "as anchor does not support tuples and tuple structs yet."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": {
              "defined": {
                "name": "withdrawIntoMixerPoolSplOutputStruct0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "withdrawIntoMixerPoolSplOutputStruct0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "field0",
            "type": "bool"
          },
          {
            "name": "field1",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field2",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "field3",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field4",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "field5",
            "type": "u128"
          },
          {
            "name": "field6",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "withdrawIntoMixerPoolSplSuccessfulCallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newUserSolBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newUserSplBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "newCommissionFeePoolBalance",
            "type": {
              "defined": {
                "name": "mxeEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "withdrawalAmountBalance",
            "type": {
              "defined": {
                "name": "sharedEncryptedStruct",
                "generics": [
                  {
                    "kind": "const",
                    "value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "commitmentVerified",
            "type": "bool"
          },
          {
            "name": "relayerFee",
            "type": "u128"
          },
          {
            "name": "doesUserHaveEnoughSolBalanceAfterWithdrawal",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "withdrawIntoMixerPoolSplUnsuccessfulCallbackEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "zkMerkleTree",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "versionByte",
            "type": {
              "defined": {
                "name": "versionByte"
              }
            }
          },
          {
            "name": "bump",
            "type": {
              "defined": {
                "name": "canonicalBump"
              }
            }
          },
          {
            "name": "initialised",
            "type": {
              "defined": {
                "name": "boolean"
              }
            }
          },
          {
            "name": "root",
            "type": {
              "defined": {
                "name": "poseidonHash"
              }
            }
          },
          {
            "name": "previousRoots",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "poseidonHash"
                  }
                },
                10
              ]
            }
          },
          {
            "name": "filledSubtrees",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "poseidonHash"
                  }
                },
                48
              ]
            }
          },
          {
            "name": "currentInsertionIndex",
            "type": {
              "defined": {
                "name": "zkMerkleTreeInsertionIndex"
              }
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "reservedSpace"
                  }
                },
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "versionByte",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "canonicalBump",
      "type": {
        "kind": "struct",
        "fields": [
          "u8"
        ]
      }
    },
    {
      "name": "reservedSpace",
      "type": {
        "kind": "struct",
        "fields": [
          "u8"
        ]
      }
    },
    {
      "name": "arciumX25519PublicKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "rescueCiphertext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "arciumX25519Nonce",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "computationOffset",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "groth16ProofA",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              64
            ]
          }
        ]
      }
    },
    {
      "name": "groth16ProofB",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              128
            ]
          }
        ]
      }
    },
    {
      "name": "groth16ProofC",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              64
            ]
          }
        ]
      }
    },
    {
      "name": "sha3Hash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "poseidonHash",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "zkMerkleTreeInsertionIndex",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "flagBits",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "amount",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "basisPoints",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "accountOffset",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "ephemeralOffset",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "year",
      "type": {
        "kind": "struct",
        "fields": [
          "i32"
        ]
      }
    },
    {
      "name": "month",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "day",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "hour",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "minute",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "seconds",
      "type": {
        "kind": "struct",
        "fields": [
          "u32"
        ]
      }
    },
    {
      "name": "blockchainId",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "time",
      "type": {
        "kind": "struct",
        "fields": [
          "i64"
        ]
      }
    },
    {
      "name": "boolean",
      "type": {
        "kind": "struct",
        "fields": [
          "bool"
        ]
      }
    },
    {
      "name": "slot",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "riskThreshold",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              16
            ]
          }
        ]
      }
    },
    {
      "name": "seed",
      "type": {
        "kind": "struct",
        "fields": [
          "u16"
        ]
      }
    },
    {
      "name": "solanaPublicAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "mintPublicAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "programDerivedAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    }
  ]
};

