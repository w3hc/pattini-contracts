const {
    loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Pattini", function () {
    async function deployContracts() {
        const [alice, bob] = await ethers.getSigners()

        const initialOwner = alice.address

        const repositoryName = "github-action-test"
        const EUR = await ethers.getContractFactory("EUR")
        const eur = await EUR.deploy()
        const tokenAddress = await eur.getAddress()

        const funderAddress = alice.address
        const Pattini = await ethers.getContractFactory("Pattini")
        const pattini = await Pattini.deploy(
            initialOwner,
            repositoryName,
            tokenAddress,
            funderAddress
        )
        await eur.transfer(await pattini.getAddress(), ethers.parseEther("200"))
        await eur.approve(await pattini.getAddress(), ethers.parseEther("200"))

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
                ethers.parseEther("200")
            )
            expect(await pattini.tokenAddress()).to.equal(tokenAddress)
        })
    })

    describe("Interactions", function () {
        it("Should take an issue", async function () {
            const { pattini, bob } = await loadFixture(deployContracts)
            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)
        })

        it("Should pay a contributor", async function () {
            const { pattini, bob, eur } = await loadFixture(deployContracts)

            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)

            expect(await eur.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("0")
            )
            await pattini.pay(88888, 83)
            expect(await eur.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("42")
            )
        })

        it("Should not take the issue", async function () {
            const { pattini, bob, eur } = await loadFixture(deployContracts)

            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)

            expect(await eur.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("0")
            )
            await pattini.pay(88888, 83)
            expect(await eur.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("42")
            )

            await expect(
                pattini.take(88888, 42, bob.address)
            ).to.be.revertedWith("Issue already paid")

            expect(await pattini.take(55555, 42, bob.address)).to.emit()
        })

        it("Should flush", async function () {
            const { pattini, bob, eur } = await loadFixture(deployContracts)

            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)

            expect(await eur.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
            await pattini.take(55555, 58, bob.address)

            await pattini.flush()

            expect(await eur.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("100")
            )
        })

        it("Should handle multiple entry for the same issue", async function () {
            const { pattini, bob, eur } = await loadFixture(deployContracts)
            await pattini.take(88888, 10, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(10)
            expect(await eur.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
            await pattini.take(88888, 10, bob.address)
            await pattini.flush()
            expect(await eur.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
        })
    })
})
