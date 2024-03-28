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

    const op = await deploy("OP", {
        from: deployer,
        args: [],
        log: true
    })

    switch (hre.network.name) {
        case "sepolia":
            try {
                console.log(
                    "OP token contract deployed:",
                    msg(op.receipt.contractAddress)
                )
                console.log("\nEtherscan verification in progress...")
                await wait(90 * 1000)
                await hre.run("verify:verify", {
                    network: network.name,
                    address: op.receipt.contractAddress,
                    constructorArguments: []
                })
                console.log("Etherscan verification done. ✅")
            } catch (error) {
                console.error(error)
            }
            break

        case "op-sepolia":
            try {
                console.log(
                    "OP ERC-20 token contract deployed:",
                    msg(op.receipt.contractAddress)
                )
                console.log("\nEtherscan verification in progress...")
                console.log(
                    "\nWaiting for 6 block confirmations (you can skip this part)"
                )
                await hre.run("verify:verify", {
                    network: network.name,
                    address: op.receipt.contractAddress,
                    constructorArguments: []
                })
                console.log("Etherscan verification done. ✅")
            } catch (error) {
                console.error(error)
            }
            break
    }
}
export const tags = ["EUR"]
