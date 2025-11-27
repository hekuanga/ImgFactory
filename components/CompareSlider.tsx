import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

export const CompareSlider = ({
  original,
  restored,
  originalAlt,
  restoredAlt,
}: {
  original: string;
  restored: string;
  originalAlt?: string;
  restoredAlt?: string;
}) => {
  return (
    <ReactCompareSlider
      itemOne={<ReactCompareSliderImage src={original} alt={originalAlt || 'Original Photo'} />}
      itemTwo={<ReactCompareSliderImage src={restored} alt={restoredAlt || 'Restored Photo'} />}
      portrait
      className='flex w-[600px] mt-5'
    />
  );
};
