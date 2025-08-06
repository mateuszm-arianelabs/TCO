export interface INftActionsTCO {
  executeMintFlowTCO(): Promise<void>;
  executeBurnFlowTCO(): Promise<void>;
  executeAirdropFlowTCO(): Promise<void>;
}
