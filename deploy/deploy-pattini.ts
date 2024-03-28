import "@nomiclabs/hardhat-ethers"
import color from "cli-color"
var msg = color.xterm(39).bgXterm(128)
import hre, { ethers, network } from "hardhat"

export default async ({ getNamedAccounts, deployments }: any) => {
    const { deploy } = deployments

    function wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    const { deployer } = await getNamedAccounts()
    console.log("\ndeployer:", deployer)

    const repositoryName = "fables-de-lafontaine"
    // const tokenAddress = "0x7f5c764cbc14f9669b88837ca1490cca17c31607" // USDC on Optimism (bridged from Ethereum)
    // const tokenAddress = "0xe6bcd785b90dc16d667b022cc871c046587d9ac5" // EUR on Sepolia
    const tokenAddress = "0x63300A7909B91a1E435Ee7f553264ec0623D018D" // OP on OP Sepolia
    const funderAddress = deployer // Alice

    const pattini = await deploy("Pattini", {
        from: deployer,
        args: [deployer, repositoryName, tokenAddress, funderAddress],
        log: true
    })

    switch (hre.network.name) {
        case "sepolia":
            try {
                console.log(
                    "Pattini contract deployed:",
                    msg(pattini.receipt.contractAddress)
                )
                console.log("\nEtherscan verification in progress...")
                await wait(90 * 1000)
                await hre.run("verify:verify", {
                    network: network.name,
                    address: pattini.receipt.contractAddress,
                    constructorArguments: [
                        deployer,
                        repositoryName,
                        tokenAddress,
                        funderAddress
                    ]
                })
                console.log("Etherscan verification done. ✅")
            } catch (error) {
                console.error(error)
            }
            break

        case "op-sepolia":
            try {
                console.log(
                    "Pattini contract deployed:",
                    msg(pattini.receipt.contractAddress)
                )
                console.log("\nEtherscan verification in progress...")
                console.log(
                    "\nWaiting for 6 block confirmations (you can skip this part)"
                )
                await hre.run("verify:verify", {
                    network: network.name,
                    address: pattini.receipt.contractAddress,
                    constructorArguments: [
                        deployer,
                        repositoryName,
                        tokenAddress,
                        funderAddress
                    ]
                })
                console.log("Etherscan verification done. ✅")
            } catch (error) {
                console.error(error)
            }
            break
    }
}
export const tags = ["Pattini"]
