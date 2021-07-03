/* eslint-disable no-unreachable */
import { useState } from "react";
import Select from "react-select";
import styles from "../style.module.css";

const Preference = (props: any) => {
    const [clicked, setClicked] = useState<number>(3);
    const setData = props.function;
    const setPriority = props.priority;


    const handleClick = (x : number, tag : number) => {

        setPriority(x);
        setClicked(tag);

    }

    return(   
        <div>
            <ul className={styles.tags}>
                <li className={`${styles.tag} ${clicked === 0 ? styles.selectedTag : ''}`}
                    onClick={() => handleClick(3, 0)}>
                     {"High"}
                </li>
                <li className={`${styles.tag} ${clicked === 1 ? styles.selectedTag : ''}`}
                    onClick={() => handleClick(2, 1)}>

                    {"Medium"}

                </li>
                <li className={`${styles.tag} ${clicked === 2 ? styles.selectedTag : ''}`}
                    onClick={() => handleClick(0.5, 2)}>
                    {"Low"}
                </li>
            </ul>
            <Select
                id={props.id}
                isMulti={props.isMulti}
                isClearable={props.isClearable}
                closeMenuOnSelect={props.closeMenuOnSelect}
                options={props.options}
                placeholder={props.placeholder}
                classNamePrefix={props.classNamePrefix}
                onChange={(val) => setData(val)}
                />
        </div>


    );
			
}

export default Preference;