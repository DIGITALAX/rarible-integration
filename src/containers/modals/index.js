import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import ModalConnectWallet from '@containers/modals/modal-connect-wallet';
import ModalPlaceBid from '@containers/modals/modal-place-bid';
import ModalRaiseBid from '@containers/modals/modal-raise-bid';
import ModalWithdrawBid from '@containers/modals/modal-withdraw-bid';
import ModalSignup from '@containers/modals/modal-sign-up';
import BuyNow from '@containers/modals/buy-now';
import PreviewMaterial from '@containers/modals/preview-material';
import ModalESPAReady from './modal-espa-ready';
import ModalConnectMatic from './modal-connect-matic';
import BuyNowCooldown from './modal-cooldown';
import BuyNowLimit from './modal-limit';
import History from './history';
import SwitchNetworkModal from './switch-network';
import PurchaseSuccess from './purchase-success';
import ModalBespoke from './modal-bespoke';
import ModalCurrentWearers from './modal-current-wearers';
import RejectOffer from './reject-offer';
import MarketplaceDown from './marketplace-down';
import Delist from './modal-delist';
import MakeOffer from './make-offer';
import SecondaryHistory from './secondary-history';
import OfferSucceeded from './offer-succeeded';

const Modals = () => {
  const modals = useSelector((state) => state.modals.toJS());
  const {
    isShowModalConnectMetamask,
    isShowModalPlaceBid,
    isShowModalRaiseBid,
    isShowModalWithdrawBid,
    isShowModalSignup,
    isShowModalConnectMatic,
    isShowBuyNow,
    isShowPreviewMaterial,
    isShowModalESPAReady,
    isLimit,
    isCoolDown,
    isBidHistory,
    isPurchaseHistory,
    isSwitchNetwork,
    isPurchaseSuccess,
    isShowModalBespoke,
    isShowModalCurrentWearers,
    isShowRejectOffer,
    isShowMakeOffer,
    isShowSecondPurchaseHistory,
    isShowDelist,
    isShowOfferSucceeded,
  } = modals;

  return (
    <>
      {isShowModalConnectMetamask && <ModalConnectWallet />}
      {isShowModalPlaceBid && <ModalPlaceBid />}
      {isShowModalRaiseBid && <ModalRaiseBid />}
      {isShowModalWithdrawBid && <ModalWithdrawBid />}
      {isShowModalSignup && <ModalSignup />}
      {isShowModalESPAReady && <ModalESPAReady />}
      {isShowModalConnectMatic && <ModalConnectMatic />}
      {isShowBuyNow && <BuyNow />}
      {isShowPreviewMaterial && <PreviewMaterial />}
      {isCoolDown && <BuyNowCooldown />}
      {isLimit && <BuyNowLimit />}
      {isBidHistory && <History type={1} />}
      {isPurchaseHistory && <History type={2} />}
      {isSwitchNetwork && <SwitchNetworkModal />}
      {isPurchaseSuccess && <PurchaseSuccess />}
      {isShowModalBespoke && <ModalBespoke />}
      {isShowModalCurrentWearers && <ModalCurrentWearers />}
      {isShowRejectOffer && <RejectOffer />}
      {isShowDelist && <Delist />}
      {isShowMakeOffer && <MakeOffer />}
      {isShowSecondPurchaseHistory && <SecondaryHistory type={2} />}
      {isShowOfferSucceeded && <OfferSucceeded />}
    </>
  );
};

export default memo(Modals);
