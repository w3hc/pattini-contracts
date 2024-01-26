const {
    loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Pattini", function () {
    async function deployContracts() {
        const [alice, bob] = await ethers.getSigners()

        const repositoryName = "github-action-test"
        const EUR = await ethers.getContractFactory("EUR")
        const eur = await EUR.deploy()
        const tokenAddress = await eur.getAddress()
        const funderAddress = alice.address
        const Pattini = await ethers.getContractFactory("Pattini")
        const pattini = await Pattini.deploy(
            repositoryName,
            tokenAddress,
            funderAddress
        )
        await eur.transfer(await pattini.getAddress(), ethers.parseEther("42"))
        return {
            pattini,
            alice,
            bob,
            repositoryName,
            funderAddress,
            tokenAddress,
            eur
        }
    }

    describe("Deployment", function () {
        it("Should return the right token address", async function () {
            const { pattini, tokenAddress, eur } = await loadFixture(
                deployContracts
            )
            expect(await eur.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("42")
            )
            expect(await pattini.tokenAddress()).to.equal(tokenAddress)
        })
    })

    describe("Interactions", function () {
        it("Should take an issue", async function () {
            const { pattini, bob } = await loadFixture(deployContracts)
            await pattini.take(1, 42, "abcd", bob.address)
            expect((await pattini.getIssue(1))[1]).to.be.equal(42)
        })
        it("Should pay a contributor", async function () {
            const { pattini, bob, eur } = await loadFixture(deployContracts)

            await pattini.take(1, 42, "abcd", bob.address)
            expect((await pattini.getIssue(1))[1]).to.be.equal(42)

            expect(await eur.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("0")
            )
            await pattini.pay(1, 83, "abcd")
            expect(await eur.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("42")
            )
        })
    })
})
