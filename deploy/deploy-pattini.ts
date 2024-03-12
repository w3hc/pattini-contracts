import "@nomiclabs/hardhat-ethers"
const color = require("cli-color")
var msg = color.xterm(39).bgXterm(128)
import hre, { ethers, network } from "hardhat"

export default async ({ getNamedAccounts, deployments }: any) => {
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()
    console.log("\ndeployer:", deployer)

    // constructor(string memory _repositoryName, address _tokenAddress, address _funderAddress)
    const repositoryName = "github-action-test"
    // const tokenAddress = "0x7f5c764cbc14f9669b88837ca1490cca17c31607" // USDC on Optimism (bridged from Ethereum)
    const tokenAddress = "0xe6bcd785b90dc16d667b022cc871c046587d9ac5" // EUR on Sepolia

    const funderAddress = "0xD8a394e7d7894bDF2C57139fF17e5CBAa29Dd977" // Alice

    const pattini = await deploy("Pattini", {
        from: deployer,
        args: [deployer, repositoryName, tokenAddress, funderAddress],
        log: true
    })

    switch (hre.network.name) {
        case "arthera":
            console.log(
                "Basic ERC-20 token contract deployed:",
                msg(pattini.receipt.contractAddress)
            )

            try {
                // Please use `pnpm sourcify:arthera` after the deployment instead.

                // console.log("\nEtherscan verification in progress...")
                // console.log(
                //     "\nWaiting for 6 block confirmations (you can skip this part)"
                // )
                // await basic.deploymentTransaction()?.wait(6)
                // await hre.run("verify:verify", {
                //     network: network.name,
                //     address: basic.receipt.contractAddress,
                //     constructorArguments: [initialMint]
                // })

                console.log(
                    "Please use `pnpm sourcify:arthera` to verify your contract."
                )
            } catch (error) {
                console.error(error)
            }

            break
        case "arthera-testnet":
            console.log(
                "Basic ERC-20 token contract deployed:",
                msg(pattini.receipt.contractAddress)
            )

            try {
                // Please use `pnpm sourcify:arthera` after the deployment instead.

                // console.log("\nEtherscan verification in progress...")
                // console.log(
                //     "\nWaiting for 6 block confirmations (you can skip this part)"
                // )
                // await basic.deploymentTransaction()?.wait(6)
                // await hre.run("verify:verify", {
                //     network: network.name,
                //     address: basic.receipt.contractAddress,
                //     constructorArguments: [repositoryName, tokenAddress ,funderAddress]
                // })

                console.log(
                    "Please use `pnpm sourcify:arthera-testnet` to verify your contract."
                )
            } catch (error) {
                console.error(error)
            }

            break
        case "sepolia":
            try {
                console.log(
                    "Basic ERC-20 token contract deployed:",
                    msg(pattini.receipt.contractAddress)
                )
                console.log("\nEtherscan verification in progress...")
                console.log(
                    "\nWaiting for 6 block confirmations (you can skip this part)"
                )
                // await basic.deploymentTransaction()?.wait(6)
                await hre.run("verify:verify", {
                    network: network.name,
                    address: pattini.receipt.contractAddress,
                    constructorArguments: [
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
                    "Basic ERC-20 token contract deployed:",
                    msg(pattini.receipt.contractAddress)
                )
                console.log("\nEtherscan verification in progress...")
                console.log(
                    "\nWaiting for 6 block confirmations (you can skip this part)"
                )
                // await basic.deploymentTransaction()?.wait(6)
                await hre.run("verify:verify", {
                    network: network.name,
                    address: pattini.receipt.contractAddress,
                    constructorArguments: [
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
