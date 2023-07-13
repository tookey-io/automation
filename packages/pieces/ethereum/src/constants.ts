
import {
    arbitrum,
    arbitrumGoerli,
    aurora,
    auroraTestnet,
    avalanche,
    avalancheFuji,
    baseGoerli,
    boba,
    bronos,
    bronosTestnet,
    bsc,
    bscTestnet,
    canto,
    celo,
    celoAlfajores,
    celoCannoli,
    cronos,
    crossbell,
    dfk,
    dogechain,
    evmos,
    evmosTestnet,
    fantom,
    fantomTestnet,
    filecoin,
    filecoinCalibration,
    filecoinHyperspace,
    flare,
    flareTestnet,
    foundry,
    iotex,
    iotexTestnet,
    goerli,
    gnosis,
    gnosisChiado,
    haqqMainnet,
    haqqTestedge2,
    hardhat,
    harmonyOne,
    klaytn,
    lineaTestnet,
    localhost,
    mainnet,
    metis,
    metisGoerli,
    moonbaseAlpha,
    moonbeam,
    moonriver,
    nexi,
    okc,
    optimism,
    optimismGoerli,
    polygon,
    polygonMumbai,
    polygonZkEvm,
    polygonZkEvmTestnet,
    pulsechain,
    pulsechainV4,
    scrollTestnet,
    sepolia,
    skaleBlockBrawlers,
    skaleCalypso,
    skaleCalypsoTestnet,
    skaleChaosTestnet,
    skaleCryptoBlades,
    skaleCryptoColosseum,
    skaleEuropa,
    skaleEuropaTestnet,
    skaleExorde,
    skaleHumanProtocol,
    skaleNebula,
    skaleNebulaTestnet,
    skaleRazor,
    skaleTitan,
    skaleTitanTestnet,
    songbird,
    songbirdTestnet,
    shardeumSphinx,
    syscoin,
    taraxa,
    taraxaTestnet,
    telos,
    telosTestnet,
    thunderTestnet,
    wanchain,
    wanchainTestnet,
    xdc,
    xdcTestnet,
    zhejiang,
    zkSync,
    zkSyncTestnet,
    zora,
    zoraTestnet,
} from 'viem/chains';

import { Chain } from 'viem/dist/types'

export const CHAINS: Record<number, Chain> = {
    [arbitrum.id]: arbitrum,
    [arbitrumGoerli.id]: arbitrumGoerli,
    [aurora.id]: aurora,
    [auroraTestnet.id]: auroraTestnet,
    [avalanche.id]: avalanche,
    [avalancheFuji.id]: avalancheFuji,
    [baseGoerli.id]: baseGoerli,
    [boba.id]: boba,
    [bronos.id]: bronos,
    [bronosTestnet.id]: bronosTestnet,
    [bsc.id]: bsc,
    [bscTestnet.id]: bscTestnet,
    [canto.id]: canto,
    [celo.id]: celo,
    [celoAlfajores.id]: celoAlfajores,
    [celoCannoli.id]: celoCannoli,
    [cronos.id]: cronos,
    [crossbell.id]: crossbell,
    [dfk.id]: dfk,
    [dogechain.id]: dogechain,
    [evmos.id]: evmos,
    [evmosTestnet.id]: evmosTestnet,
    [fantom.id]: fantom,
    [fantomTestnet.id]: fantomTestnet,
    [filecoin.id]: filecoin,
    [filecoinCalibration.id]: filecoinCalibration,
    [filecoinHyperspace.id]: filecoinHyperspace,
    [flare.id]: flare,
    [flareTestnet.id]: flareTestnet,
    [foundry.id]: foundry,
    [iotex.id]: iotex,
    [iotexTestnet.id]: iotexTestnet,
    [goerli.id]: goerli,
    [gnosis.id]: gnosis,
    [gnosisChiado.id]: gnosisChiado,
    [haqqMainnet.id]: haqqMainnet,
    [haqqTestedge2.id]: haqqTestedge2,
    [hardhat.id]: hardhat,
    [harmonyOne.id]: harmonyOne,
    [klaytn.id]: klaytn,
    [lineaTestnet.id]: lineaTestnet,
    [localhost.id]: localhost,
    [mainnet.id]: mainnet,
    [metis.id]: metis,
    [metisGoerli.id]: metisGoerli,
    [moonbaseAlpha.id]: moonbaseAlpha,
    [moonbeam.id]: moonbeam,
    [moonriver.id]: moonriver,
    [nexi.id]: nexi,
    [okc.id]: okc,
    [optimism.id]: optimism,
    [optimismGoerli.id]: optimismGoerli,
    [polygon.id]: polygon,
    [polygonMumbai.id]: polygonMumbai,
    [polygonZkEvm.id]: polygonZkEvm,
    [polygonZkEvmTestnet.id]: polygonZkEvmTestnet,
    [pulsechain.id]: pulsechain,
    [pulsechainV4.id]: pulsechainV4,
    [scrollTestnet.id]: scrollTestnet,
    [sepolia.id]: sepolia,
    [skaleBlockBrawlers.id]: skaleBlockBrawlers,
    [skaleCalypso.id]: skaleCalypso,
    [skaleCalypsoTestnet.id]: skaleCalypsoTestnet,
    [skaleChaosTestnet.id]: skaleChaosTestnet,
    [skaleCryptoBlades.id]: skaleCryptoBlades,
    [skaleCryptoColosseum.id]: skaleCryptoColosseum,
    [skaleEuropa.id]: skaleEuropa,
    [skaleEuropaTestnet.id]: skaleEuropaTestnet,
    [skaleExorde.id]: skaleExorde,
    [skaleHumanProtocol.id]: skaleHumanProtocol,
    [skaleNebula.id]: skaleNebula,
    [skaleNebulaTestnet.id]: skaleNebulaTestnet,
    [skaleRazor.id]: skaleRazor,
    [skaleTitan.id]: skaleTitan,
    [skaleTitanTestnet.id]: skaleTitanTestnet,
    [songbird.id]: songbird,
    [songbirdTestnet.id]: songbirdTestnet,
    [shardeumSphinx.id]: shardeumSphinx,
    [syscoin.id]: syscoin,
    [taraxa.id]: taraxa,
    [taraxaTestnet.id]: taraxaTestnet,
    [telos.id]: telos,
    [telosTestnet.id]: telosTestnet,
    [thunderTestnet.id]: thunderTestnet,
    [wanchain.id]: wanchain,
    [wanchainTestnet.id]: wanchainTestnet,
    [xdc.id]: xdc,
    [xdcTestnet.id]: xdcTestnet,
    [zhejiang.id]: zhejiang,
    [zkSync.id]: zkSync,
    [zkSyncTestnet.id]: zkSyncTestnet,
    [zora.id]: zora,
    [zoraTestnet.id]: zoraTestnet,
};